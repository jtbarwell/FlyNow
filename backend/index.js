import express from 'express';
import cors from 'cors';
import session from 'express-session'; 
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import 'dotenv/config';


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

async function login(email, password) {
  const user = udb.data.users.find(u => u.email === email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await login(email, password);
  if (user) {
    req.session.user = user;
    return res.json({ valid: true, firstName: user.firstName });
  }
  return res.json({ valid: false });
});

app.get('/api/check-login', (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, email: req.session.user.email });
  }
  return res.json({ loggedIn: false });
});

// LOGOUT

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    return res.json({ valid: !err });
  });
});

// SIGN UP

async function signup(email, password, firstName, lastName) {
  const user = udb.data.users.find(u => u.email === email);
  if (user) return false;

  const passwordHash = await bcrypt.hash(password, 10);
  
  udb.data.users.push({
    userID: udb.data.users.length,
    email,
    password: passwordHash,
    firstName,
    lastName,
    bookings: []
  });
  await udb.write();

  return true;
}

app.post('/api/signup', async (req, res) => {
  const { email, password, firstName, surname } = req.body;
  const valid = await signup(email, password, firstName, surname);
  return res.json({ valid });
});

// ADMIN LOGIN

async function getAdmin(email, password) {
    console.log("TESTTESTTEST")
  const admin = adb.data.admins.find(a => a.email === email);
  if (!admin) { console.log("Admin not found"); return null;}

  console.log("password " + password);
  console.log("admin.password " + admin.password);
  const valid = await bcrypt.compare(password, admin.password);
    console.log("valid " + valid);
  return valid ? admin : null;
}

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  await adb.read();

  if (!email || !password) {
    return res.json({ valid: false, message: 'Email and password are required.' });
  }

  const admin = await getAdmin(email, password);
  console.log("admin: " + JSON.stringify(admin));
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

  const existing = adb.data.admins.find(admin => admin.email === email);
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
  const admin = adb.data.admins.find(a => a.email === req.session.admin.email);
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

app.get('/api/admin/flights/:flightID/passengers', requireAdmin, async (req, res) => {
  await fdb.read();
  await bdb.read();
  await udb.read();
  const flightID = Number(req.params.flightID);
  const bookings = bdb.data.bookings.filter(b => b.flights.find(f => f.flightID === flightID));
  console.log(bookings)

  const passengerList = [];

  for (const booking of bookings) {
    const user = udb.data.users.find(u => u.userID === booking.userID)
    for (const flightInfo of booking.flights) {
      if (flightInfo.flightID === flightID) {
        for (const seat of flightInfo.seats) {
          passengerList.push({
            seat,
            userID: user.userID,
            bookingID: booking.bookingID,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
        }
      }
    }
  }
  
  return res.json({ valid: true, message: 'Passenger list retrieved successfully', body: {passengerList} });
});

// SEARCH

function search(origin, destination, departure_date) {
  const flights = fdb.data.flights.filter(f => f.origin === origin && f.destination === destination && f.departureTime.startsWith(departure_date));
  // insert logic to filter for flights with enough available seats for passengers here
  return flights;
}

app.post('/api/search', (req, res) => {
  const { origin, destination, trip_type, departure_date, return_date, traveller_count } = req.body;
  const outboundFlights = search(origin, destination, departure_date);
  const returnFlights = (trip_type === 'round-trip') ? search(destination, origin, return_date) : [];
  return res.json({ outboundFlights, returnFlights });
});

// BOOK

async function calculateBookingPrice(bookedFlights, additionalCheckedBags) {
  await fdb.read();

  let totalPrice = 0;
  for (const flightInfo of bookedFlights) {
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID)
    for (const seat of flightInfo.seats) {
      const seatInfo = flight.seats.find(s => s.name === seat);
      if (seatInfo) {
          const seatCost = flight.price[seatInfo.class] || 0;
          totalPrice += seatCost;
      }
    }
  }
    
  totalPrice += (additionalCheckedBags * 50); // Assuming $50 per additional checked bag, replace with variable

  return totalPrice;
}

async function handlePayment(payment) {
  // implement payment logic in a full system
  return;
}

async function bookingConfirm(userID, tripType, travellerCount, bookedFlights, additionalCheckedBags) {
  const booking = {
    bookingID: bdb.data.bookings.length,
    userID: userID,
    tripType: tripType,
    travellerCount: travellerCount,
    additionalCheckedBags: additionalCheckedBags,
    flights: [],
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
  // Ensure all bookings in DB have explicit isCancelled flag (default false)
  bdb.data.bookings = bdb.data.bookings.map(b => ({
    ...b,
    isCancelled: Object.prototype.hasOwnProperty.call(b, 'isCancelled') ? b.isCancelled : false
  }));
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

  const payment = await calculateBookingPrice(bookedFlights, additionalCheckedBags);
  await handlePayment(payment);

  const booking = await bookingConfirm(req.session.user.userID, tripType, travellerCount, bookedFlights, additionalCheckedBags);
  return res.json({ booking });
});

app.post('/api/cancel-booking', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  await udb.read();
  await bdb.read();
  await fdb.read();

  const bookingID = req.body.bookingID;

  if (typeof bookingID !== 'number') {
    return res.status(400).json({ error: 'No valid booking IDs provided' });
  }

  const userID = req.session.user.userID;
  const booking = bdb.data.bookings.find(b => b.userID === userID && b.bookingID === bookingID);

  if (!booking) {
    return res.status(403).json({ error: 'The specified booking is not owned by the logged in user' });
  }

  const now = new Date();

  if (booking.isCancelled) {
    return res.status(400).json({ error: 'The selected booking is already cancelled' });
  }

  for (const flightInfo of booking.flights) {
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
    if (!flight) {
      return res.status(400).json({ error: `One or more flights were not found for booking ${booking.bookingID}` });
    }

    const departure = new Date(flight.departureTime);
    if (departure <= now) {
      return res.status(400).json({ error: 'Cannot cancel past flights' });
    }
  }

  booking.isCancelled = true;
  for (const flightInfo of booking.flights) {
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
    if (flight) {
      for (const seatName of flightInfo.seats) {
        const seat = flight.seats.find(s => s.name === seatName);
        if (seat) {
          seat.booked = false;
        }
      }
    }
  }
  await bdb.write();
  await udb.write();
  await fdb.write();

  return res.json({ cancelledBookingID: [booking.bookingID] });
});

app.get('/api/my-trips', async (req, res) => {
  if (!req.session.user) {
    return { status: 401, data: { error: 'Not logged in' } };
  }

  await bdb.read();
  await fdb.read();

  const userBookings = bdb.data.bookings.filter(b => b.userID === req.session.user.userID);
  const tripsMap = {};
  const now = new Date();

  for (const booking of userBookings) {
    const bookingCancelled = !!booking.isCancelled;
    const tripKey = booking.bookingID;
    
    if (!tripsMap[tripKey]) {
      tripsMap[tripKey] = {
        tripID: tripKey,
        tripType: booking.tripType ?? 'one-way',
        additionalCheckedBags: booking.additionalCheckedBags ?? 0,
        travellerCount: booking.travellerCount ?? 1,
        flights: [],
        isCancelled: true,
        isCancelable: false
      };
    }

    for (const flightInfo of booking.flights) {
      const flight = fdb.data.flights[flightInfo.flightID];
      if (!flight) continue;

      tripsMap[tripKey].flights.push({
        flightID: flight.flightID,
        bookingID: booking.bookingID,
        name: flight.name,
        airline: flight.airline,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        seats: flightInfo.seats,
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
  }

  const trips = Object.values(tripsMap).map(trip => ({
    ...trip,
    isCancelable: trip.isCancelable && !trip.isCancelled
  })).sort((a, b) => {
    const dateA = new Date(a.flights[0]?.departureTime || 0);
    const dateB = new Date(b.flights[0]?.departureTime || 0);
    return dateA - dateB;
  });

  return res.json({ status: 200, data: { trips } });
});

app.get('/api/my-trips', async (req, res) => {
  const result = await viewTrips(req);
  if (result.status !== 200) {
    return res.status(result.status).json(result.data);
  }
  return res.json(result.data);
});

// CANCELBOOKING



// EMAIL NOTIFICATION

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendNotificationEmail(subject, htmlBody, sendTo) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sendTo,
    replyTo: process.env.EMAIL_USER || undefined,
    subject,
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
}

app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await sendNotificationEmail(
      `New test email from ${name || 'FlyNow test page'}`,
      `<p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Message:</strong> ${message}</p>`,
      email
    );
    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Email failed to send' });
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));