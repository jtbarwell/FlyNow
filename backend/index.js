import express from 'express';
import cors from 'cors';
import session from 'express-session'; 
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use(
  session({
    secret: 'CP317',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 30
    }
  })
);

const udb = new Low(new JSONFile('users.json'), { users: [] });
const bdb = new Low(new JSONFile('bookings.json'), { bookings: [] });
const fdb = new Low(new JSONFile('flights.json'), { flights: [] });

await udb.read();
await bdb.read();
await fdb.read();

// LOGIN

function login(email, password) {
  const user = udb.data.users.find(u => u.email === email && u.password === password);
  if (user) return user;
  return null;
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = login(email, password);
  if (user) req.session.user = user;
  return res.json({ valid: !!user });
});

// LOGOUT

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    return res.json({ valid: !err });
  });
});

// SIGN UP

async function signup(email, password) {
  const user = udb.data.users.find(u => u.email === email);
  if (user) return false;
  
  udb.data.users.push({
    userID: udb.data.users.length,
    email: email,
    password: password,
    bookings: []
  });
  await udb.write();

  return true;
}

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const valid = await signup(email, password);
  return res.json({ valid });
});

// SEARCH

function search(origin, destination, departure_date) {
  const flights = fdb.data.flights.filter(f => f.origin === origin && f.destination === destination && f.departureTime.startsWith(departure_date));
  return flights;
}

app.post('/api/search', (req, res) => {
  const { origin, destination, trip_type, departure_date, return_date, traveller_count } = req.body;
  const flights = search(origin, destination, departure_date);
  return res.json(flights);
});

// BOOK

function bookingStart(req, flightID) {
  const booking = {
    bookingID: bdb.data.bookings.length,
    userID: req.session.user.userID,
    flightID: flightID,
    travellers: []
  };

  return booking;
}

app.post('/api/bookingStart', (req, res) => {
  req.session.booking = bookingStart(req, req.body.flightID);
  return res.json({ valid: true });
});

app.post('/api/bookingSeat', (req, res) => {
  req.session.booking.seat = req.body.seat;
  return res.json({ valid: true });
});

app.post('/api/bookingTraveller', (req, res) => {
  req.session.booking.travellers.push(req.body);
  return res.json({ valid: true });
});

async function bookingConfirm(req) {
  const {bookedFlights, additionalCheckedBags} = req.body;
  const bookings = [];
  for (const flight of bookedFlights) {
    for (const bookedSeat of flight.seats) {
      const booking = {
        bookingID: bdb.data.bookings.length,
        userID: req.session.user.userID,
        flightID: flight.flightID,
        seat: bookedSeat,
        isCancelled: false
      };

      bdb.data.bookings.push(booking);
      await bdb.write();

      udb.data.users[req.session.user.userID].bookings.push(booking.bookingID);
      await udb.write();

      const seat = fdb.data.flights[booking.flightID].seats.find(s => s.name === booking.seat);
      seat.booked = true;
      await fdb.write();

      bookings.push(booking);
    }
  }
  // Ensure all bookings in DB have explicit isCancelled flag (default false)
  bdb.data.bookings = bdb.data.bookings.map(b => ({
    ...b,
    isCancelled: Object.prototype.hasOwnProperty.call(b, 'isCancelled') ? b.isCancelled : false
  }));
  await bdb.write();

  return bookings;
}

app.post('/api/bookingConfirm', async (req, res) => {
  const bookings = await bookingConfirm(req);
  return res.json({ bookings });
});

app.post('/api/cancel-booking', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  await udb.read();
  await bdb.read();
  await fdb.read();

  const bookingIDs = Array.isArray(req.body.bookingIDs) ? req.body.bookingIDs : [req.body.bookingID];
  const validIDs = bookingIDs.filter(id => typeof id === 'number');

  if (validIDs.length === 0) {
    return res.status(400).json({ error: 'No valid booking IDs provided' });
  }

  const userID = req.session.user.userID;
  const userBookings = bdb.data.bookings.filter(b => b.userID === userID && validIDs.includes(b.bookingID));

  if (userBookings.length !== validIDs.length) {
    return res.status(403).json({ error: 'One or more bookings are not owned by the logged in user' });
  }

  const now = new Date();
  for (const booking of userBookings) {
    if (booking.isCancelled) {
      return res.status(400).json({ error: 'One or more selected bookings are already cancelled' });
    }

    const flight = fdb.data.flights.find(f => f.flightID === booking.flightID);
    if (!flight) {
      return res.status(400).json({ error: `Flight not found for booking ${booking.bookingID}` });
    }

    const departure = new Date(flight.departureTime);
    if (departure <= now) {
      return res.status(400).json({ error: 'Cannot cancel past flights' });
    }
  }

  const cancelledBookingIDs = [];
  for (const booking of userBookings) {
    booking.isCancelled = true;
    cancelledBookingIDs.push(booking.bookingID);

    const flight = fdb.data.flights.find(f => f.flightID === booking.flightID);
    if (flight) {
      const seat = flight.seats.find(s => s.name === booking.seat);
      if (seat) {
        seat.booked = false;
      }
    }
  }

  await bdb.write();
  await udb.write();
  await fdb.write();

  return res.json({ cancelledBookingIDs });
});

app.get('/api/my-trips', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  await bdb.read();
  await fdb.read();

  const userBookings = bdb.data.bookings.filter(b => b.userID === req.session.user.userID);
  const tripsMap = {};
  const now = new Date();

  for (const booking of userBookings) {
    const flight = fdb.data.flights[booking.flightID];
    if (!flight) continue;

    const bookingCancelled = !!booking.isCancelled;
    const tripKey = booking.tripID ?? `legacy-${booking.bookingID}`;
    if (!tripsMap[tripKey]) {
      tripsMap[tripKey] = {
        tripID: tripKey,
        tripType: booking.tripType ?? 'one-way',
        additionalCheckedBags: booking.additionalCheckedBags ?? 0,
        travellerCount: 0,
        bookingIDs: [],
        flights: [],
        isCancelled: true,
        isCancelable: false
      };
    }

    tripsMap[tripKey].travellerCount += 1;
    tripsMap[tripKey].bookingIDs.push(booking.bookingID);
    tripsMap[tripKey].flights.push({
      flightID: flight.flightID,
      bookingID: booking.bookingID,
      name: flight.name,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      seat: booking.seat,
      price: flight.price,
      isCancelled: bookingCancelled
    });

    if (!bookingCancelled) {
      tripsMap[tripKey].isCancelled = false;
      const departure = new Date(flight.departureTime);
      if (departure > now) {
        tripsMap[tripKey].isCancelable = true;
      }
    }
  }

  const trips = Object.values(tripsMap).map(trip => ({
    ...trip,
    isCancelable: trip.isCancelable && !trip.isCancelled
  })).sort((a, b) => {
    const dateA = new Date(a.flights[0]?.departureTime || 0);
    const dateB = new Date(b.flights[0]?.departureTime || 0);
    return dateA - dateB;
  });

  return res.json({ trips });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

