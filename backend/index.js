import express from 'express';
import cors from 'cors';
import session from 'express-session'; 
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import 'dotenv/config';


const app = express();
const PORT = 3001; 

const POINTS_REDEMPTION_INCREMENT = 1000; // points per redemption "step"
const POINTS_REDEMPTION_VALUE = 25;       // dollars discount per redemption step

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
const rdb = new Low(new JSONFile('resets.json'), { resets: [] });

await udb.read();
await bdb.read();
await fdb.read();
await adb.read();
await rdb.read();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function equals(s1, s2) {
  if (typeof s1 !== 'string' || typeof s2 !== 'string') return false;
  return s1.trim().toLowerCase() === s2.trim().toLowerCase();
}

// LOGIN

async function login(email, password) {
  const user = udb.data.users.find(u => equals(u.email, email));
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await login(email, password);
  if (user) {
    req.session.user = user;
    return res.json({ valid: true, firstName: user.firstName, lastName: user.lastName });
  }
  return res.json({ valid: false });
});

app.get('/api/check-login', (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, email: req.session.user.email });
  }
  return res.json({ loggedIn: false });
});

// LOYALTY POINTS

app.get('/api/user/points', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  await udb.read();

  const user = udb.data.users.find(u => u.userID === req.session.user.userID);

  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({

    points: user.points || 0,
    redemptionIncrement: POINTS_REDEMPTION_INCREMENT,
    redemptionValue: POINTS_REDEMPTION_VALUE
  });
});

// LOGOUT

app.post('/api/logout', (req, res) => {
    req.session.user = null;
    req.session.destroy((err) => {
        return res.json({ valid: !err });
    });
});

// SIGN UP

async function signup(email, password, firstName, lastName) {
  const user = udb.data.users.find(u => equals(u.email, email));
  if (user) return false;

  const passwordHash = await bcrypt.hash(password, 10);
  
  udb.data.users.push({
    userID: udb.data.users.length,
    email,
    password: passwordHash,
    firstName,
    lastName,
    points: 0,
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

// PASSWORD RESET

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');  // 64-char hex string
}

app.post('/api/request-password-reset', async(req, res) => {
    const { email } = req.body;
    await udb.read();
    await rdb.read();

    const user = udb.data.users.find(u => equals(u.email, email));

    if (!user) { return res.json({ success: true, message: 'If the provided email exists, a reset link has been sent. The link expires in 5 minutes.'}); }

    const token = generateResetToken();
    const expiresAt = Date.now() + 1000 * 60 * 5 // 5 minutes from now

    rdb.data.resets.push({ token, email, expiresAt, used: false });
    await rdb.write();

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const { subject, html } = buildResetPasswordEmail({ name: user.firstName, resetLink });
    await sendNotificationEmail( subject, html, email );


    return res.json({ success: true, message: 'If the provided email exists, a reset link has been sent. The link expires in 5 minutes.'})
});

async function passwordReset(email, password) {
    const user = udb.data.users.find(u => equals(u.email, email));
    if (!user) return false;

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    await udb.write();

    return true;
}

app.post('/api/confirm-password-reset', async(req, res) => {
    const { token, password } = req.body;
    await rdb.read();

    if (!token || !password) { return res.status(400).json({ success: false, message: 'Invalid reset request.' }); }

    const resetEntry = rdb.data.resets.find(r => r.token === token);
    if (!resetEntry)        { return res.status(400).json({ success: false, message: 'Invalid reset request'}); }
    if (resetEntry.used)    { return res.status(400).json({ success: false, message: 'This reset link has already been used.' }); }
    if (Date.now() > resetEntry.expiresAt) { return res.status(400).json({ success: false, message: 'This reset link is expired.'}); }

    const success = await passwordReset(resetEntry.email, password);
    if (!success)           { return res.status(400).json({ success: false, message: 'Could not reset password.' }); }

    resetEntry.used = true;
    await rdb.write();

    return res.json({ success: true, message: 'Password has been reset successfully.' });
})

// LOYALTY POINTS

app.get('/api/user/points', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  await udb.read();

  const user = udb.data.users.find(u => u.userID === req.session.user.userID);

  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({

    points: user.points || 0,
    redemptionIncrement: POINTS_REDEMPTION_INCREMENT,
    redemptionValue: POINTS_REDEMPTION_VALUE
  });
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
  return res.json({ valid: true, flights: fdb.data.flights.filter(f => f.isCancelled === null || !f.isCancelled) });
});

// save changes to flight details
app.post('/api/admin/flights', requireAdmin, async (req, res) => {
  const { flightID, name, origin, destination, departureTime, arrivalTime, price } = req.body;
  await fdb.read();

  const index = fdb.data.flights.findIndex(f => f.flightID === Number(flightID));
  if (index === -1) {
    return res.status(404).json({ valid: false, message: 'Flight not found' });
  }

  const oldFlightNumber = fdb.data.flights[index].name;
  const oldOrigin = fdb.data.flights[index].origin;
  const oldDestination = fdb.data.flights[index].destination;

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


  // email all passengers about flight changes
  await bdb.read();
  await udb.read();
  await fdb.read();
  const bookings = bdb.data.bookings.filter(b => !b.isCancelled && b.flights.find(f => f.flightID === flightID));
  // loop through bookings and send email to each passenger
  for (const booking of bookings) {
    const user = udb.data.users.find(u => u.userID === booking.userID);
    if (!user) { continue; }


    const { subject, html } = buildFlightChangeEmail({
        name: user.firstName,
        oldFlightNumber: oldFlightNumber,
        oldOrigin: oldOrigin,
        oldDestination: oldDestination,
        newFlightNumber: fdb.data.flights[index].name,
        airline: fdb.data.flights[index].airline,
        newOrigin: fdb.data.flights[index].origin,
        newDestination: fdb.data.flights[index].destination,
        newDepartureTime: fdb.data.flights[index].departureTime,
        newArrivalTime: fdb.data.flights[index].arrivalTime
    });
    await sendNotificationEmail(subject, html, user.email);
  }


  
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

app.post('/api/admin/flights/upload', requireAdmin, async (req, res) => {
  const { flights } = req.body;
  await fdb.read();

  for (const flight of flights) {
    const newFlight = {
      flightID: fdb.data.flights.length,
      name: flight.name,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      price: {
        economy: Number(flight.price?.economy),
        business: Number(flight.price?.business),
        firstClass: Number(flight.price?.firstClass)
      },
      seats: flight.seats
    };
    fdb.data.flights.push(newFlight);
  }
  
  await fdb.write();
  return res.json({ valid: true, message: 'Flights created successfully', flights });
});

// cancel flight (soft delete)
app.delete('/api/admin/flights/:flightID', requireAdmin, async (req, res) => {
  await fdb.read();
  const flightID = Number(req.params.flightID);
  
  const index = fdb.data.flights.findIndex(f => f.flightID === flightID);
  if (index === -1) {
    return res.status(404).json({ valid: false, message: 'Flight not found' });
  }

  fdb.data.flights[index] = {
    ...fdb.data.flights[index],
    isCancelled: true
  };

  // email all passengers booked on this flight
  await bdb.read();
  await udb.read();
  const bookings = bdb.data.bookings.filter(b => !b.isCancelled && b.flights.find(f => f.flightID === flightID));
  // loop through bookings and send email to each passenger
  for (const booking of bookings) {
    const user = udb.data.users.find(u => u.userID === booking.userID);
    if (!user) { continue; }


    const { subject, html } = buildFlightCancellationEmail({
        name: user.firstName,
        flightNumber: fdb.data.flights[index].name,
        airline: fdb.data.flights[index].airline,
        origin: fdb.data.flights[index].origin,
        destination: fdb.data.flights[index].destination
    });
    await sendNotificationEmail(subject, html, user.email);
  }

  // mark all bookings for this flight as cancelled
  for (const booking of bookings) {
    for (const flightInfo of booking.flights) {
      if (flightInfo.flightID === flightID) {
        flightInfo.isCancelled = true;
      }
    }
  }

  await bdb.write();
  await fdb.write();
  return res.json({ valid: true, message: 'Flight cancelled successfully' });
});

app.get('/api/admin/flights/:flightID/passengers', requireAdmin, async (req, res) => {
  await fdb.read();
  await bdb.read();
  await udb.read();
  const flightID = Number(req.params.flightID);
  const bookings = bdb.data.bookings.filter(b => !b.isCancelled && b.flights.find(f => f.flightID === flightID));

  const passengerList = [];

  for (const booking of bookings) {
    const user = udb.data.users.find(u => u.userID === booking.userID)
    for (const flightInfo of booking.flights) {
      if (flightInfo.flightID === flightID && !flightInfo.isCancelled) {
        for (const seat of flightInfo.seats) {
          if (!seat) { continue; }
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

// ADMIN STATS PAGE

function compareClockTimes(date1, date2) {
  // Normalize both times to the exact same calendar day
  const time1 = new Date(2000, 0, 1, date1.getHours(), date1.getMinutes(), date1.getSeconds());
  const time2 = new Date(2000, 0, 1, date2.getHours(), date2.getMinutes(), date2.getSeconds());

  return time1.getTime() - time2.getTime(); 
  // Returns negative if date1 is earlier in the day, 0 if identical, positive if later
}

function getTimePeriod(time) {
  const early = new Date('2026-01-01T05:00:00');
  const mid = new Date('2026-01-01T12:00:00');
  const late = new Date('2026-01-01T17:00:00');

  const t = new Date(time);
  
  if (compareClockTimes(t, late) > 0) {
    return "Evening";
  } else if (compareClockTimes(t, mid) > 0) {
    return "Afternoon";
  } else if (compareClockTimes(t, early) > 0) {
    return "Morning";
  }
  return "Overnight";
}

function handleTimePeriodDifference(tp1, tp2) {
  const extraTimes = []
  if ((tp1 === "Overnight" && (tp2 === "Afternoon" || tp2 === "Evening")) || (tp1 === "Afternoon" && tp2 === "Evening")) {
    extraTimes.push("Morning");
  } 
  if ((tp1 === "Morning" && (tp2 === "Evening" || tp2 === "Overnight")) || (tp1 === "Evening" && tp2 === "Overnight")) {
    extraTimes.push("Afternoon")
  }
  if ((tp1 === "Afternoon" && (tp2 === "Overnight" || tp2 === "Morning")) || (tp1 === "Overnight" && tp2 === "Morning")) {
    extraTimes.push("Evening")
  }
  if ((tp1 === "Evening" && (tp2 === "Morning" || tp2 === "Afternoon")) || (tp1 === "Morning" && tp2 === "Afternoon")) {
    extraTimes.push("Overnight")
  }

  return extraTimes;
}

app.get('/api/admin/flights/stats', requireAdmin, async (req, res) => {
  await fdb.read();
  await bdb.read();
  const bookings = bdb.data.bookings.filter(b => !b.isCancelled);
  const flights = fdb.data.flights.filter(f => !f.isCancelled);

  const bookingsPerRoute = [];

  const flightsPerTimePeriod = {
    Overnight: 0,
    Morning: 0,
    Afternoon: 0,
    Evening: 0
  };

  const bookingsPerAirline = []; // {airline, count}

  // Get bookings per flight (popular flights)
  for (const booking of bookings) {
    for (const flightInfo of booking.flights) {
      if (!flightInfo.isCancelled) {
        
        const flight = flights.find(f => f.flightID === flightInfo.flightID);

        for (const seat of flightInfo.seats) {
          if (!seat) { continue; }

          const routeData = bookingsPerRoute.find(f => f.name === flight.name)
          if (routeData) {
            routeData.count += 1;
          } else {
            bookingsPerRoute.push({
              name: flight.name, 
              origin: flight.origin,
              destination: flight.destination, 
              count: 1
            })
          }
          
          const airlineData = bookingsPerAirline.find(f => f.airline === flight.airline)
          if (airlineData) {
            airlineData.count += 1;
          } else {
            bookingsPerAirline.push({airline: flight.airline, count: 1})
          }
          
        }
      }
    }
  }

  bookingsPerRoute.sort((a, b) => b.count - a.count);

  // Get flights per time period
  for (const flight of flights) {
    const t1 = flight.departureTime
    const t2 = flight.arrivalTime
    const tp1 = getTimePeriod(t1)
    const tp2 = getTimePeriod(t2)
    flightsPerTimePeriod[tp1] += 1;
    if (tp2 != tp1) { 
      flightsPerTimePeriod[tp2] += 1;
      const extraTimes = handleTimePeriodDifference(tp1, tp2);
      for (const period of extraTimes) {
        flightsPerTimePeriod[period] += 1;
      }
    }
  }
  
  return res.json({ 
    valid: true, 
    message: 'Statistics retrieved successfully', 
    body: {
      bookingsPerRoute,
      flightsPerTimePeriod,
      bookingsPerAirline
    } 
  });
});


// SEARCH

function search(origin, destination, departure_date) {
  const flights = fdb.data.flights.filter(f => equals(f.origin, origin) && equals(f.destination, destination) && f.departureTime.startsWith(departure_date));
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

// Payment/Pricing

function baggageCostForFlight(flightID) {
  const flight = fdb.data.flights.find(f => f.flightID === flightID);
  return baggageCostByAirline[flight?.airline] ?? defaultBaggageCost;
}

async function calculateBookingPrice(bookedFlights, additionalCheckedBags, additionalCheckedBagsReturn) {
  await fdb.read();
  let totalPrice = 0;

  // Add seat costs
  for (const flightInfo of bookedFlights) {
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID)
    for (const seat of flightInfo.seats) {
      if (!seat) { continue; }
      const seatInfo = flight.seats.find(s => s.name === seat);
      if (seatInfo) {
          const seatCost = flight.price[seatInfo.class] || 0;
          totalPrice += seatCost;
      }
    }
  }

  // Add baggage costs
  totalPrice += additionalCheckedBags * baggageCostForFlight(bookedFlights[0].flightID);
  if (bookedFlights.length === 2) {totalPrice += additionalCheckedBagsReturn * baggageCostForFlight(bookedFlights[1].flightID);}

  return totalPrice;
}

function resolvePointsRedemption(totalPrice, requestedPoints, userPoints) {
  const requested = Number(requestedPoints) || 0;
  if (requested < 0 || requested % POINTS_REDEMPTION_INCREMENT !== 0) {
    return { valid: false, error: `Points must be redeemed in increments of ${POINTS_REDEMPTION_INCREMENT}.` };
  }

  if (requested > userPoints) {
    return { valid: false, error: 'You do not have enough points to redeem that amount.' };
  }

  const maxIncrementsForPrice = Math.floor(totalPrice / POINTS_REDEMPTION_VALUE);
  const maxPointsForPrice = Math.floor(totalPrice / POINTS_REDEMPTION_VALUE) * POINTS_REDEMPTION_INCREMENT;

  if (requested > maxPointsForPrice) {
    return { valid: false, error: 'You cannot redeem more points than the total price of the booking.' };
  }

  const discount = (requested / POINTS_REDEMPTION_INCREMENT) * POINTS_REDEMPTION_VALUE;

  return { valid: true, pointsRedeemed: requested, discount };
}

const defaultBaggageCost = 50;
const baggageCostByAirline = {
  "Air Canada": 60,
  "WestJet": 85,
  "Delta Airlines": 55
};

app.get('/api/baggage-cost', (req, res) => {
  const airline = req.query.airline || '';
  const fee = baggageCostByAirline[airline] ?? defaultBaggageCost;
  return res.json({ valid: true, fee });
});


app.post('/api/create-payment-intent', async (req, res) => {
  if (!req.session.user) return;

  const {bookedFlights, additionalCheckedBags, additionalCheckedBagsReturn, pointsRedeemed} = req.body;

  // Calculate base price
  const totalPrice = await calculateBookingPrice(bookedFlights, additionalCheckedBags, additionalCheckedBagsReturn);

  // Apply loyalty point discount
  await udb.read()
  const user = udb.data.users.find(u => u.userID === req.session.user.userID);
  const redemption = resolvePointsRedemption(totalPrice, pointsRedeemed || 0, user.points || 0);
  if (!redemption.valid) {
    return res.status(400).json({ error: redemption.error });
  }
  const finalPrice = totalPrice - redemption.discount;
  const pointsEarned = Math.floor(finalPrice); // 1 point per whole dollar actually spent before tax
  const newPointsBalance = user.points - pointsRedeemed + pointsEarned
  
  // Add Tax
  const taxRate = 0.13
  const afterTaxPrice = finalPrice * (1 + taxRate)

  // Convert to cents for payment processing
  const payment = Math.round(afterTaxPrice * 100);

  // Create payment intent with final price
  const paymentIntent = await stripe.paymentIntents.create({
    amount: payment,
    currency: 'cad',
    automatic_payment_methods: { enabled:true },
    metadata: {
      databaseUserId: req.session.user?.userID
    }
  });
  
  res.status(200).send({
    clientSecret: paymentIntent.client_secret,
    bookingPointsSummary: {
      totalPrice,
      discount: redemption.discount,
      finalPrice,
      pointsEarned,
      pointsBalance: newPointsBalance
    }
  })
});

// Save Booking

async function bookingConfirm(userID, tripType, travellerCount, bookedFlights, additionalCheckedBags, additionalCheckedBagsReturn, travellers, totalPrice, pointsRedeemed, discount, finalPrice, pointsEarned) {
  const booking = {
    bookingID: bdb.data.bookings.length,
    userID: userID,
    tripType: tripType,
    travellerCount: travellerCount,
    additionalCheckedBags,
    additionalCheckedBagsReturn,
    flights: [],
    travellers: Array.isArray(travellers) ? travellers : [],
    totalPrice: totalPrice,
    pointsRedeemed: pointsRedeemed,
    discount: discount,
    finalPrice: finalPrice,
    pointsEarned: pointsEarned,
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
  // Ensure all bookings in DB have explicit isCancelled flags (default false)
  bdb.data.bookings = bdb.data.bookings.map(b => ({
    ...b,
    isCancelled: Object.prototype.hasOwnProperty.call(b, 'isCancelled') ? b.isCancelled : false,
    flights: (b.flights || []).map(f => ({
      ...f,
      isCancelled: Object.prototype.hasOwnProperty.call(f, 'isCancelled') ? f.isCancelled : !!b.isCancelled
    })),
    travellers: (b.travellers || []).map(t => ({
      ...t,
      isCancelled: Object.prototype.hasOwnProperty.call(t, 'isCancelled') ? t.isCancelled : !!b.isCancelled
    }))
  }));
  await bdb.write();

  const user = udb.data.users[userID];
  user.bookings.push(booking.bookingID);
  user.points = (user.points || 0) - pointsRedeemed + pointsEarned;
  await udb.write();

  return booking;
}

app.post('/api/bookingConfirm', async (req, res) => {
  if (!req.session.user) {return res.status(401).json({ error: 'Not logged in' });}

  const { tripType, travellerCount, bookedFlights, additionalCheckedBags, additionalCheckedBagsReturn, travellers, pointsRedeemed } = req.body;

  await udb.read();
  const userID = req.session.user.userID;
  const user = udb.data.users.find(u => u.userID === userID);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }


  // Calculate earned Loyalty Points
  const totalPrice = await calculateBookingPrice(bookedFlights, additionalCheckedBags, additionalCheckedBagsReturn);
  const redemption = resolvePointsRedemption(totalPrice, pointsRedeemed || 0, user.points || 0);
  if (!redemption.valid) {
    return res.status(400).json({ error: redemption.error });
  }
  const finalPrice = totalPrice - redemption.discount;
  const pointsEarned = Math.floor(finalPrice); // 1 point per whole dollar actually spent

  const booking = await bookingConfirm(
    userID,
    tripType,
    travellerCount,
    bookedFlights,
    additionalCheckedBags,
    additionalCheckedBagsReturn,
    travellers,
    totalPrice,
    redemption.pointsRedeemed,
    redemption.discount,
    finalPrice,
    pointsEarned
  );



// loop confirmation email if roundtrip, otherwise just send one email
const loopCount = tripType === 'one-way' ? 1 : 2;

for (let i = 0; i < loopCount; i++) {
  // For each leg, pick the corresponding booked flight (0 = outbound, 1 = return)
  const legIndex = i;
  if (legIndex >= bookedFlights.length) continue;

  const bookedLeg = bookedFlights[legIndex];
  const flight = fdb.data.flights.find(fl => fl.flightID === bookedLeg.flightID) || {};

  const bookedFlightAirline = flight.airline ?? bookedLeg.flightID;
  const bookedFlightNames = flight.name ?? bookedLeg.flightID;
  const bookedFlightOrigin = flight.origin ?? bookedLeg.flightID;
  const bookedFlightDestination = flight.destination ?? bookedLeg.flightID;

  const { subject: confirmationSubject, html: confirmationHtml } =
    buildBookingConfirmationEmail({
      name: user.firstName,
      bookingID: booking.bookingID,
      flightNumber: bookedFlightNames,
      airline: bookedFlightAirline,
      origin: bookedFlightOrigin,
      destination: bookedFlightDestination,
      tripType,
      travellerCount,
      bookedFlights: [bookedLeg],
      additionalCheckedBags
    });

  await sendNotificationEmail(
    confirmationSubject,
    confirmationHtml,
    user.email
  );
}



  return res.json({ booking, pointsBalance: udb.data.users[userID].points });
});


// CANCELBOOKING

app.post('/api/cancel-booking', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  await udb.read();
  await bdb.read();
  await fdb.read();

  const bookingID = req.body.bookingID;
  const flightID = req.body.flightID;
  const travellerIndex = req.body.travellerIndex;

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

  if (typeof travellerIndex === 'number') {
    if (travellerIndex < 0 || travellerIndex >= booking.travellerCount) {
      return res.status(400).json({ error: 'No valid traveller provided' });
    }

    const traveller = booking.travellers[travellerIndex];
    if (traveller && traveller.isCancelled) {
      return res.status(400).json({ error: 'The selected traveller has already been cancelled' });
    }

    const activeLegs = booking.flights.filter(f => !f.isCancelled);
    const targetLegs = (typeof flightID === 'number')
      ? activeLegs.filter(f => f.flightID === flightID && f.seats[travellerIndex])
      : activeLegs;
    const futureLegs = targetLegs.filter(f => {
      const flight = fdb.data.flights.find(fl => fl.flightID === f.flightID);
      return flight && new Date(flight.departureTime) > now;
    });

    if (futureLegs.length === 0) {
      return res.status(400).json({ error: 'No upcoming flights found for this traveller' });
    }

    let refund = 0;
    for (const flightInfo of futureLegs) {
      const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
      const seatName = flightInfo.seats[travellerIndex];
      if (flight && seatName) {
        const seat = flight.seats.find(s => s.name === seatName);
        if (seat) {
          seat.booked = false;
          refund += flight.price[seat.class] || 0;
        }
        flightInfo.seats[travellerIndex] = null;
      }
    }

    const hasRemainingSeats = booking.flights.some(f =>
      !f.isCancelled && f.seats[travellerIndex]
    );

    if (!hasRemainingSeats) {
      if (traveller) {
        traveller.isCancelled = true;
      } else {
        booking.travellers[travellerIndex] = { firstName: `Traveller ${travellerIndex + 1}`, lastName: '', isCancelled: true };
      }
    }

    for (const flightInfo of booking.flights) {
      if (!flightInfo.isCancelled && flightInfo.seats.every(s => !s)) {
        flightInfo.isCancelled = true;
      }
    }

    const allTravellersCancelled = booking.travellers.length >= booking.travellerCount
      && booking.travellers.every(t => t && t.isCancelled);
    if (allTravellersCancelled || booking.flights.every(f => f.isCancelled)) {
      for (const flightInfo of booking.flights) {
        flightInfo.isCancelled = true;
      }
      booking.isCancelled = true;
    }

    await bdb.write();
    await udb.write();
    await fdb.write();

    return res.json({
      cancelledBookingID: [booking.bookingID],
      cancelledTravellerIndex: travellerIndex,
      cancelledFlightIDs: futureLegs.map(f => f.flightID),
      bookingFullyCancelled: booking.isCancelled,
      refund: refund
    });
  }

  const legsCancelled = (typeof flightID === 'number')
    ? booking.flights.filter(f => f.flightID === flightID && !f.isCancelled)
    : booking.flights.filter(f => !f.isCancelled);


  if (legsCancelled.length === 0) {
    return res.status(400).json({ error: 'No active flights found to cancel' });
  }

  for (const flightInfo of legsCancelled) {
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
    if (!flight) {
      return res.status(400).json({ error: `One or more flights were not found for booking ${booking.bookingID}` });
    }

    const departure = new Date(flight.departureTime);
    if (departure <= now) {
      return res.status(400).json({ error: 'Cannot cancel past flights' });
    }
  }

  for (const flightInfo of legsCancelled) {
    flightInfo.isCancelled = true;
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
    if (flight) {
      for (const seatName of flightInfo.seats) {
        if (!seatName) { continue; }
        const seat = flight.seats.find(s => s.name === seatName);
        if (seat) {
          seat.booked = false;
        }
      }
    }
  }

  const user = udb.data.users.find(u => u.userID === userID);
  if (user) {
    const pointsEarned = booking.pointsEarned || 0;
    const pointsRedeemed = booking.pointsRedeemed || 0;
    user.points = Math.max(0, (user.points || 0) - pointsEarned + pointsRedeemed);
  }

  booking.isCancelled = booking.flights.every(f => f.isCancelled);

  let refund = 0;
  for (const flightInfo of legsCancelled) {
    const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
    if (flight) {
      for (const seatName of flightInfo.seats) {
        if (!seatName) { continue; }
        const seatInfo = flight.seats.find(s => s.name === seatName);
        if (seatInfo) {
          refund += flight.price[seatInfo.class] || 0;
        }
      }
    }
  }

  await bdb.write();
  await udb.write();
  await fdb.write();

  return res.json({
    cancelledBookingID: [booking.bookingID],
    cancelledFlightIDs: legsCancelled.map(f => f.flightID),
    bookingFullyCancelled: booking.isCancelled,
    refund: refund,
    pointsBalance: user ? user.points : undefined
  });
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
    const bookingCancelled = !!booking.isCancelled;
    const tripKey = booking.bookingID;
    
    if (!tripsMap[tripKey]) {
      tripsMap[tripKey] = {
        tripID: tripKey,
        tripType: booking.tripType ?? 'one-way',
        additionalCheckedBags: booking.additionalCheckedBags ?? 0,
        travellerCount: booking.travellerCount ?? 1,
        totalPrice: booking.totalPrice,
        discount: booking.discount ?? 0,
        pointsRedeemed: booking.pointsRedeemed ?? 0,
        finalPrice: booking.finalPrice,
        pointsEarned: booking.pointsEarned ?? 0,
        travellers: booking.travellers ?? [],
        flights: [],
        isCancelled: true,
        isCancelable: false
      };
    }

    for (const flightInfo of booking.flights) {
      const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
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
        isCancelled: bookingCancelled || !!flightInfo.isCancelled
      });

      if (!bookingCancelled && !flightInfo.isCancelled) {
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


// EMAIL NOTIFICATION

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function buildTestEmail({ name }) {
  return {
    subject: `New test email from ${name}`,
    html: `<p>This is a test. Please do not reply to this email.</p>`,
  };
}
function buildResetPasswordEmail({ name, resetLink }) {
    return {
        subject: `New Password Reset Request`,
        html:  `<p>Hi ${user.firstName},</p>
            <p>Click the link below to reset your password. This link expires in 5 minutes.</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>`
    }
}
function buildBookingConfirmationEmail({ name, bookingID, flightNumber, airline, origin, destination, tripType, travellerCount, bookedFlights, additionalCheckedBags }) {
    return {
        subject: `Booking Confirmation - ${airline} Flight ${flightNumber} from ${origin} to ${destination}`,
        html:`<p>Hi ${name},</p>
            <p>Your booking of flight ${flightNumber} has been confirmed. Thank you for choosing FlyNow!</p>
            <p>Booking Details:</p>
            <ul>
            <li>Trip Type: ${tripType}</li>
            <li>Number of Travellers: ${travellerCount}</li>
            <li>Additional Checked Bags: ${additionalCheckedBags}</li>
            </ul>
            <p>We hope you have a pleasant journey!</p>
            <p>Best regards,<br/>FlyNow Team</p>`
    }
}
function buildFlightChangeEmail({ name, oldFlightNumber, oldOrigin, oldDestination, newFlightNumber, airline, newOrigin, newDestination, newDepartureTime, newArrivalTime }) {
    return {
        subject: `Flight Details Updated - ${airline} Flight ${oldFlightNumber} from ${oldOrigin} to ${oldDestination}`,
        html:`<p>Hi ${name},</p>
            <p>Your booking of flight ${newFlightNumber} has been updated. You can find the new details below.</p>
            <p>Booking Details:</p>
            <ul>
                <li>Airline: ${airline}</li>
                <li>Flight: ${newFlightNumber}</li>
                <li>Origin: ${newOrigin}</li>
                <li>Destination: ${newDestination}</li>
                <li>Departure: ${newDepartureTime}</li>
                <li>Arrival: ${newArrivalTime}</li>
            </ul>
            <p>We apologize for the inconvenience, and hope you have a pleasant journey!</p>
            <p>Best regards,<br/>FlyNow Team</p>`
    }
}
function buildFlightCancellationEmail({ name, flightNumber, airline, origin, destination }) {
    return {
        subject: `Flight Cancellation - ${airline} Flight ${flightNumber} from ${origin} to ${destination}`,
        html: `<p>Hi ${name},</p>
            <p>Your flight ${flightNumber} has been cancelled.</p>
            <p>We apologize for any inconvenience this may cause.</p>
            <p>Best regards,<br/>FlyNow Team</p>`
    }
}
function buildFlightApproachingEmail({ name, flightNumber, airline, origin, destination }) {
    return {
    subject: `Your Flight, ${airline} Flight ${flightNumber} from ${origin} to ${destination}, is approaching.`,
    html: `<p>Hi ${name},</p>
        <p>Your flight ${flightNumber} is departing soon.</p>
        <p>Don't forget to arrive at the airport at least 3 hours before takeoff for International, or at least 1 hour before takeoff for Domestic.</p>
        <p>Have a great flight!<br/>FlyNow Team</p>`
    }
}


const emailTemplates = {
    testEmail: buildTestEmail,
    resetPasswordEmail: buildResetPasswordEmail,
    bookingConfirmationEmail: buildBookingConfirmationEmail,
    flightCancellationEmail: buildFlightCancellationEmail,
    flightApproachingEmail: buildFlightApproachingEmail
}


async function sendNotificationEmail(subject, htmlBody, sendTo) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: sendTo,
        replyTo: process.env.EMAIL_USER || undefined, subject,
        html: htmlBody,
    };
    await transporter.sendMail(mailOptions);
}

app.post('/api/send-email', async (req, res) => {
    const { templateType, to, data } = req.body;
    const buildTemplate = emailTemplates[templateType];
    if (!buildTemplate) return res.status(400).json({ success: false, message: `Unknown templateType: ${templateType}` });
    if (!to) return res.status(400).json({ success: false, message: 'Missing "to" address' });
    
    try {
        const { subject, html } = buildTemplate(data || {});
        await sendNotificationEmail( subject, html, to);
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Email failed to send' });
    }
});


// function loop that always runs in background, waiting until midnight each day. Checks when flights are on day+1 and emails users their flight is approaching
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function checkTimeDiff(futureTimeStr) {
    const futureTime = new Date(futureTimeStr);
    const currTime = new Date();
    const diffInMS = futureTime - currTime;

    // Hour thresholds in MS
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    
    // Check if valid
    if (diffInMS >= twentyFourHoursInMs && diffInMS < fortyEightHoursInMs) 
         { return true;  }
    else { return false; }
}



async function flightApproachLoop() {

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24,0,0,0);
    const msUntilMidnight = midnight - now;
    // await sleep(msUntilMidnight);

    await sleep(10000);


    await bdb.read();
    await fdb.read();
    await udb.read();

    for (const booking of bdb.data.bookings || []) {
        if (!booking || !Array.isArray(booking.flights)) { continue; }

        for (const flightInfo of booking.flights) {
            const flight = fdb.data.flights.find(f => f.flightID === flightInfo.flightID);
            if (!flight) { continue; }
            const user = udb.data.users.find(u => u.userID === booking.userID);
            if (!user) { continue; }

            if (checkTimeDiff(flight.departureTime)) {
                // email all passengers, flight upcoming
                const { subject, html } = buildFlightApproachingEmail({
                    name: user.firstName,
                    flightNumber: flight.name,
                    airline: flight.airline,
                    origin: flight.origin,
                    destination: flight.destination
                })
                await sendNotificationEmail(subject, html, user.email);
            }
        }
    }

    // loop
    // flightApproachLoop();
}




flightApproachLoop();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));