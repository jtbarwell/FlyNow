import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Initializing Stripe outside of component render to avoid rebuilding the object
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY): null;

export default function ReviewBookingPage() {
    const [tripData, setTripData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [additionalCheckedBags, setAdditionalCheckedBags] = useState(0);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const loginCheck = async () => {
            const res = await fetch('http://localhost:3001/api/check-login', {
                method: 'GET',
                credentials: "include"
            });
            const data = await res.json();
            if (!data.loggedIn) {
                window.location.href = "/login";
            }
        }
        const fetchData = async () => {

            const savedTripData = localStorage.getItem('tripData');
            const parsedTripData = savedTripData ? JSON.parse(savedTripData) : null;
            
            const savedSelectedSeats = localStorage.getItem('selectedSeats');
            const parsedSelectedSeats = savedSelectedSeats ? JSON.parse(savedSelectedSeats) : null;
            
            const savedAdditionalCheckedBags = localStorage.getItem('additionalCheckedBags');
            const parsedAdditionalCheckedBags = savedAdditionalCheckedBags ? parseInt(savedAdditionalCheckedBags) : 0;

            // update state so UI stays in sync
            if (parsedTripData) setTripData(parsedTripData);
            if (parsedSelectedSeats) setSelectedSeats(parsedSelectedSeats);
            if (!isNaN(parsedAdditionalCheckedBags)) setAdditionalCheckedBags(parsedAdditionalCheckedBags);

            const bookedFlights = [];
            for (let i = 0; i < parsedTripData.flights.length; i++) {
                bookedFlights.push({
                        flightID: parsedTripData.flights[i].flightID,
                        seats: parsedSelectedSeats[i] || []
                    });
            };

            // Create Payment Intent (payment processing stuff)
            fetch('http://localhost:3001/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookedFlights, additionalCheckedBags: parsedAdditionalCheckedBags}),
                })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        };

        loginCheck();
        fetchData();
    }, []);

    function renderFlightInfo(flight, flightIndex) {
        const dep_time = new Date(flight.departureTime);
        const arr_time = new Date(flight.arrivalTime);
        const format_dep_time = dep_time.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
        const format_arr_time = arr_time.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
        return (
            <div className="flight-info">
                <h5>{format_dep_time} - {format_arr_time}</h5>
                <h6>{flight.origin} - {flight.destination}</h6>
                <div className="flight-info-bottom-bar">
                    <p>Flight: {flight.name}</p>
                    <p>{selectedSeats[flightIndex] ? selectedSeats[flightIndex].join(', ') : 'None'}</p>
                </div>
            </div>
        );
    }

    function calculateTotalPrice(flights) {
        let totalPrice = 0;
        for (const flight of flights) {
            for (const seat of selectedSeats[tripData.flights.indexOf(flight)] || []) {
                const seatInfo = flight.seats.find(s => s.name === seat);
                if (seatInfo) {
                    const seatCost = flight.price[seatInfo.class] || 0;
                    totalPrice += seatCost;
                }
            }
        }
        return totalPrice + (additionalCheckedBags * 50); // Assuming $50 per additional checked bag
    }

    function getTotalPriceOfLevel(flight, level) {
        // find total price of seats selected for this flight and level
        let totalPrice = 0;
        const levelSeats = flight.seats.filter(s => s.class === level);
        for (const seat of selectedSeats[tripData.flights.indexOf(flight)] || []) {
            const seatInfo = levelSeats.find(s => s.name === seat);
            if (seatInfo) {
                const seatCost = flight.price[seatInfo.class] || 0;
                totalPrice += seatCost;
            }
        }
        return totalPrice;
    }

    function PriceBreakdown() {
        if (!tripData) return null;
        return (
            <div className="price-breakdown">
                <h5>Flights</h5>
                {tripData.flights.map((flight, index) => (
                    <div key={index} className="flight-price-breakdown">
                        <h5>Flight {index + 1}: {flight.name}</h5>
                        <p>Economy (${flight.price.economy.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'economy').toFixed(2)}</p>
                        <p>Business (${flight.price.business.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'business').toFixed(2)}</p>
                        <p>First Class (${flight.price.firstClass.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'firstClass').toFixed(2)}</p>
                        <p>Additional Checked Bags: {additionalCheckedBags} x $50 = ${(additionalCheckedBags * 50).toFixed(2)}</p>
                    </div>
                ))}
                
            </div>
        );
    }

    const options = { clientSecret };

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the review booking page where you can review all the information of your selected trip and checkout.</p>

            <div className="back-panel">
                <div className="booking-menu">
                    <h2>Review Your Booking Information</h2>
                    <hr></hr>
                    <h3>{tripData?.airlines.join(' + ')}</h3>
                    <h4>{tripData?.origin} &rarr; {tripData?.destination}</h4>
                    <h5>{tripData?.tripType === 'one-way' ? 'One-Way' : 'Round-Trip'} - {tripData?.travellerCount} Traveller{tripData?.travellerCount !== 1 ? 's' : ''}</h5>
                    
                    {tripData?.tripType === 'round-trip' && tripData?.flights.length > 1 ? (
                        <div className="trip-list">
                            <div className="object-panel">
                                {tripData && renderFlightInfo(tripData?.flights[0], 0)}
                            </div>
                            <br></br>
                            <div className="object-panel">
                                {tripData && renderFlightInfo(tripData?.flights[1], 1)}
                            </div>
                        </div>
                    ) : (
                        <div className="trip-list">
                            <div className="object-panel">
                                {tripData && renderFlightInfo(tripData?.flights[0] , 0)}
                            </div>
                        </div>
                    )}

                    <br></br>

                    <PriceBreakdown></PriceBreakdown>

                    <div className="trip-price">
                        <h4>Total Price: ${tripData ? calculateTotalPrice(tripData.flights).toFixed(2) : '0.00'}</h4>
                    </div>

                    <hr></hr>

                    {clientSecret && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                     )}

                </div>
            </div>
        </div>
    );
}

