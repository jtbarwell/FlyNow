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
  const booking = req.session.booking;

  bdb.data.bookings.push(booking);
  await bdb.write();

  udb.data.users[booking.userID].bookings.push(booking.bookingID);
  await udb.write();

  const seat = fdb.data.flights[booking.flightID].seats.find(s => s.name === booking.seat);
  seat.booked = true;
  await fdb.write();

  return booking;
}

app.post('/api/bookingConfirm', async (req, res) => {
  const booking = await bookingConfirm(req);
  req.session.booking = null;
  return res.json({ booking });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
