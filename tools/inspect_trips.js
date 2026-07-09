import fs from 'fs';

const bookings = JSON.parse(fs.readFileSync('backend/bookings.json','utf8')).bookings;
const flights = JSON.parse(fs.readFileSync('backend/flights.json','utf8')).flights;

const userID = process.argv[2] ? Number(process.argv[2]) : 0;
const now = new Date();

const userBookings = bookings.filter(b => b.userID === userID);
const tripsMap = {};

for (const booking of userBookings) {
  const flight = flights[booking.flightID];
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
})).sort((a,b)=> new Date(a.flights[0]?.departureTime||0) - new Date(b.flights[0]?.departureTime||0));

console.log(`Now: ${now.toISOString()}`);
console.log(JSON.stringify(trips, null, 2));
