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
const adb = new Low(new JSONFile('admins.json'), { admins: [] });

await udb.read();
await bdb.read();
await fdb.read();
await adb.read();

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
    return res.json({ valid: !user });
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

// ADMIN LOGIN

function getAdmin(email, password) {
  return adb.data.admins.find(admin => admin.email === email && admin.password === password) || null;
}

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  await adb.read();

  if (!email || !password) {
    return res.json({ valid: false, message: 'Email and password are required.' });
  }

  const admin = getAdmin(email, password);
  if (admin) {
    req.session.admin = { email };
    return res.json({ valid: true });
  }

  return res.json({ valid: false, message: 'Invalid admin credentials.' });
});

app.post('/api/admin/create', async (req, res) => {
  const { email, password, passwordRepeat, pin } = req.body;
  await adb.read();

  if (!email || !password || !passwordRepeat || !pin) {
    return res.json({ valid: false, message: 'All fields are required.' });
  }

  if (pin !== '123456') {
    return res.json({ valid: false, message: 'Invalid admin pin.' });
  }

  if (password !== passwordRepeat) {
    return res.json({ valid: false, message: 'Passwords do not match.' });
  }

  const existing = adb.data.admins.find(admin => admin.email === email);
  if (existing) {
    return res.json({ valid: false, message: 'An admin account already exists with that email.' });
  }

  const newAdmin = {
    adminID: adb.data.admins.length,
    email,
    password
  };

  adb.data.admins.push(newAdmin);
  await adb.write();

  return res.json({ valid: true, message: 'Admin account created successfully.' });
});

function requireAdmin(req, res, next) {
  if (req.session.admin) {
    return next();
  }

  return res.status(401).json({ valid: false, message: 'Admin authentication required' });
}

app.get('/api/admin/flights', requireAdmin, async (req, res) => {
  await fdb.read();
  return res.json({ valid: true, flights: fdb.data.flights });
});

app.post('/api/admin/flights', requireAdmin, async (req, res) => {
  const { flightID, name, origin, destination, departureTime, arrivalTime, price } = req.body;
  await fdb.read();

  const index = fdb.data.flights.findIndex(f => f.flightID === Number(flightID));
  if (index === -1) {
    return res.status(404).json({ valid: false, message: 'Flight not found' });
  }

  fdb.data.flights[index] = {
    ...fdb.data.flights[index],
    name,
    origin,
    destination,
    departureTime,
    arrivalTime,
    price: {
      economy: Number(price?.economy),
      business: Number(price?.business),
      firstClass: Number(price?.firstClass)
    }
  };

  await fdb.write();
  return res.json({ valid: true, message: 'Flight updated successfully' });
});

app.post('/api/admin/flights/new', requireAdmin, async (req, res) => {
  const { name, origin, destination, departureTime, arrivalTime, price } = req.body;
  await fdb.read();

  const newFlight = {
    flightID: fdb.data.flights.length,
    name,
    airline: 'FlyNow Admin',
    origin,
    destination,
    departureTime,
    arrivalTime,
    price: {
      economy: Number(price?.economy),
      business: Number(price?.business),
      firstClass: Number(price?.firstClass)
    },
    seats: []
  };

  fdb.data.flights.push(newFlight);
  await fdb.write();
  return res.json({ valid: true, message: 'Flight created successfully', flight: newFlight });
});

app.delete('/api/admin/flights/:flightID', requireAdmin, async (req, res) => {
  await fdb.read();
  const flightID = Number(req.params.flightID);
  fdb.data.flights = fdb.data.flights.filter(f => f.flightID !== flightID);
  await fdb.write();
  return res.json({ valid: true, message: 'Flight deleted successfully' });
});

app.get('/api/admin/flights/:flightID/passengers', requireAdmin, async (req, res) => {
  await bdb.read();
  await udb.read();

  const flightID = Number(req.params.flightID);
  const bookings = bdb.data.bookings.filter(b => b.flightID === flightID);
  const passengers = bookings.map(booking => {
    const user = udb.data.users.find(u => u.userID === booking.userID);
    return {
      bookingID: booking.bookingID,
      seat: booking.seat,
      name: user?.email || 'Passenger',
      email: user?.email || ''
    };
  });

  return res.json({ valid: true, passengers });
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
        seat: bookedSeat
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
  return bookings;
}

app.post('/api/bookingConfirm', async (req, res) => {
  const bookings = await bookingConfirm(req);
  return res.json({ bookings });
});

app.get('/api/my-trips', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  await bdb.read();
  await fdb.read();

  const userBookings = bdb.data.bookings.filter(b => b.userID === req.session.user.userID);
  const tripsMap = {};

  for (const booking of userBookings) {
    const flight = fdb.data.flights[booking.flightID];
    if (!flight) continue;

    const tripKey = booking.tripID ?? `legacy-${booking.bookingID}`;
    if (!tripsMap[tripKey]) {
      tripsMap[tripKey] = {
        tripID: tripKey,
        tripType: booking.tripType ?? 'one-way',
        additionalCheckedBags: booking.additionalCheckedBags ?? 0,
        travellerCount: 0,
        flights: []
      };
    }

    tripsMap[tripKey].travellerCount += 1;
    tripsMap[tripKey].flights.push({
      flightID: flight.flightID,
      name: flight.name,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      seat: booking.seat,
      price: flight.price
    });
  }

  const trips = Object.values(tripsMap).sort((a, b) => {
    const dateA = new Date(a.flights[0]?.departureTime || 0);
    const dateB = new Date(b.flights[0]?.departureTime || 0);
    return dateA - dateB;
  });

  return res.json({ trips });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));