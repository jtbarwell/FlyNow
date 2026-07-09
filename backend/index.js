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

// VIEW TRIP

async function viewTrips(req) {
  if (!req.session.user) {
    return { status: 401, data: { error: 'Not logged in' } };
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

  return { status: 200, data: { trips } };
}

app.get('/api/my-trips', async (req, res) => {
  const result = await viewTrips(req);
  if (result.status !== 200) {
    return res.status(result.status).json(result.data);
  }
  return res.json(result.data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// CANCELBOOKING

import express from 'express';
import cors from 'cors';
import session from 'express-session'; 
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcrypt';

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

// MISC

// extra space- and case-insensitive equality check for two strings
function equals(s1,  s2) {
  if (typeof s1 !== 'string' || typeof s2 !== 'string') return false;
  return s1.trim().toLowerCase() === s2.trim().toLowerCase();
}


// LOGIN

function login(email, password) {
  const user = udb.data.users.find(u => u.email === email.toLowerCase() && u.password === password);
  if (user) return user;
  return null;
}

app.post('/api/login', (req, res) => {
  // console.log("LOGIN HERE HERE AAHHH");
  const { email, password } = req.body;
  const user = login(email, password);
  if (user) req.session.user = user;
  return res.json({ valid: !!user });
});


// LOGOUT

app.post('/api/logout', (req, res) => {
    // console.log("LOGOUT HERE HERE AAHHH");
    req.session.destroy(() => {
        res.clearCookie('connect.sid'); // or whatever your session cookie is named
        res.json({ message: 'Logged out successfully' });
    });
});

// SIGN UP

async function signup(firstName, surname, email, password) {

    // function handleAddItem() { return crypto.randomUUID(); }

    const user = udb.data.users.find(u => u.email === email.toLowerCase());
    if (user) return false;

    udb.data.users.push({
        userID: udb.data.users.length,
        authCode: handleAddItem(),
        firstName: firstName,
        surname: surname,
        email: email.toLowerCase(),
        password: password,
        bookings: []
    });
    await udb.write();

    return true;
}

app.post('/api/signup', async (req, res) => {
    const { firstName, surname, email, password } = req.body;
    const valid = await signup(firstName, surname, email, password);
    return res.json({ valid });
});

// ADMIN LOGIN

async function getAdmin(email, password) {
  const admin = adb.data.admins.find(a => equals(a.email, email));
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.password);
  return valid ? admin : null;
}

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  await adb.read();

  if (!email || !password) {
    return res.json({ valid: false, message: 'Email and password are required.' });
  }

  const admin = await getAdmin(email, password);
  if (admin) {
    req.session.admin = { email };
    return res.json({ valid: true, admin: { fullName: admin.fullName || admin.email, email: admin.email } });
  }

  return res.json({ valid: false, message: 'Invalid admin credentials.' });
});

app.post('/api/admin/create', async (req, res) => {
  const { email, fullName, password, passwordRepeat, pin } = req.body;
  await adb.read();

  if (!email || !fullName || !password || !passwordRepeat || !pin) {
    return res.json({ valid: false, message: 'All fields are required.' });
  }

  if (pin !== '123456') {
    return res.json({ valid: false, message: 'Invalid admin pin.' });
  }

  if (password !== passwordRepeat) {
    return res.json({ valid: false, message: 'Passwords do not match.' });
  }

  const existing = adb.data.admins.find(admin => equals(admin.email, email));
  if (existing) {
    return res.json({ valid: false, message: 'An admin account already exists with that email.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newAdmin = {
    adminID: adb.data.admins.length,
    email,
    fullName,
    password: passwordHash
  };

  adb.data.admins.push(newAdmin);
  await adb.write();

  return res.json({ valid: true, message: 'Admin account created successfully.' });
});

app.get('/api/admin/me', requireAdmin, async (req, res) => {
  await adb.read();
  const admin = adb.data.admins.find(a => equals(a.email, req.session.admin.email));
  if (!admin) {
    return res.json({ valid: false, message: 'Admin not found.' });
  }

  return res.json({ valid: true, admin: { adminID: admin.adminID, email: admin.email, fullName: admin.fullName || admin.email } });
});

app.get('/api/admin/list', requireAdmin, async (req, res) => {
  await adb.read();
  const admins = adb.data.admins.map(({ adminID, email, fullName }) => ({ adminID, email, fullName }));
  return res.json({ valid: true, admins });
});

app.post('/api/admin/update', requireAdmin, async (req, res) => {
  const { adminID, fullName, password } = req.body;
  await adb.read();

  if (adminID === undefined || adminID === null || !fullName) {
    return res.json({ valid: false, message: 'Admin ID and full name are required.' });
  }

  const index = adb.data.admins.findIndex(admin => admin.adminID === Number(adminID));
  if (index === -1) {
    return res.json({ valid: false, message: 'Admin not found.' });
  }

  adb.data.admins[index].fullName = fullName;
  if (password) {
    adb.data.admins[index].password = await bcrypt.hash(password, 10);
  }

  await adb.write();
  return res.json({ valid: true, message: 'Admin updated successfully.' });
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
  const passengers = [];

  for (const booking of bdb.data.bookings) {
    if (booking.isCancelled) continue;
    for (const bookedFlight of booking.flights) {
      if (bookedFlight.flightID !== flightID) continue;
      const user = udb.data.users.find(u => u.userID === booking.userID);
      for (const seat of bookedFlight.seats) {
        passengers.push({
          bookingID: booking.bookingID,
          seat: seat,
          name: user?.email || 'Passenger',
          email: user?.email || ''
        });
      }
    }
  }

  return res.json({ valid: true, passengers });
});

// SEARCH

function search(origin, destination, departure_date) {
  const flights = fdb.data.flights.filter(f => equals(f.origin, origin) && equals(f.destination, destination) && 
                                               f.departureTime.startsWith(departure_date));
  return flights;
}

app.post('/api/search', (req, res) => {
  const { origin, destination, trip_type, departure_date, return_date, traveller_count } = req.body;
  const outboundFlights = search(origin, destination, departure_date);
  const returnFlights = (trip_type === 'round-trip') ? search(destination, origin, return_date) : [];
  return res.json({ outboundFlights, returnFlights });
});

// BOOK

async function bookingConfirm(userID, tripType, travellerCount, bookedFlights, additionalCheckedBags) {
  const booking = {
    bookingID: bdb.data.bookings.length,
    userID: userID,
    tripType: tripType,
    travellerCount: travellerCount,
    additionalCheckedBags: additionalCheckedBags,
    flights: [],
    travellers: [],
    isCancelled: false
  };

  for (const flight of bookedFlights) {
    booking.flights.push({
      flightID: flight.flightID,
      seats: flight.seats
    });

    const flights = fdb.data.flights.find(f => f.flightID === flight.flightID);
    for (const seat of flight.seats) {
      const foundSeat = flights?.seats.find(s => s.name === seat);
      if (foundSeat) foundSeat.booked = true;
    }
  }
  await fdb.write();

  bdb.data.bookings.push(booking);
  await bdb.write();

  udb.data.users[userID].bookings.push(booking.bookingID);
  await udb.write();

  return booking;
}

app.post('/api/bookingConfirm', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { tripType, travellerCount, bookedFlights, additionalCheckedBags } = req.body;
  const booking = await bookingConfirm(req.session.user.userID, tripType, travellerCount, bookedFlights, additionalCheckedBags);
  return res.json({ booking });
});

app.get('/api/my-trips', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const bookings = bdb.data.bookings.filter(b => b.userID === req.session.user.userID && !b.isCancelled);

  const tripsMap = bookings.map(b => ({
    tripID: b.bookingID,
    tripType: b.tripType,
    travellerCount: b.travellerCount,
    additionalCheckedBags: b.additionalCheckedBags,
    flights: b.flights.map(f => ({
      ...fdb.data.flights.find(fl => fl.flightID === f.flightID),
      seats: undefined,
      seat: f.seats.join(', ')
    }))
  }));

  const trips = tripsMap.sort((a, b) => {
    const dateA = new Date(a.flights[0]?.departureTime || 0);
    const dateB = new Date(b.flights[0]?.departureTime || 0);
    return dateA - dateB;
  });
  
  return res.json({ trips });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
