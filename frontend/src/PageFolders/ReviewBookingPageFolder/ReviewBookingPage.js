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
    const [baggageFee, setBaggageFee] = useState(50);
    const [additionalCheckedBagsReturn, setAdditionalCheckedBagsReturn] = useState(0);
    const [returnBaggageFee, setReturnBaggageFee] = useState(50);

    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const loginCheck = async () => { // Checks if user is logged in, sends them to login screen if not
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
            // Actually doing what this function is called
            const savedTripData = localStorage.getItem('tripData');
            const parsedTripData = savedTripData ? JSON.parse(savedTripData) : null;
            
            const savedSelectedSeats = localStorage.getItem('selectedSeats');
            const parsedSelectedSeats = savedSelectedSeats ? JSON.parse(savedSelectedSeats) : null;
            
            const savedAdditionalCheckedBags = localStorage.getItem('additionalCheckedBags');
            const parsedAdditionalCheckedBags = savedAdditionalCheckedBags ? parseInt(savedAdditionalCheckedBags) : 0;

            const savedAdditionalCheckedBagsReturn = localStorage.getItem('additionalCheckedBagsReturn');
            const parsedAdditionalCheckedBagsReturn = savedAdditionalCheckedBagsReturn ? parseInt(savedAdditionalCheckedBagsReturn) : 0;

            // Update state so UI stays in sync
            if (parsedTripData) setTripData(parsedTripData);
            if (parsedSelectedSeats) setSelectedSeats(parsedSelectedSeats);
            if (!isNaN(parsedAdditionalCheckedBags)) setAdditionalCheckedBags(parsedAdditionalCheckedBags);
            if (!isNaN(parsedAdditionalCheckedBagsReturn)) setAdditionalCheckedBagsReturn(parsedAdditionalCheckedBagsReturn);

            // Format booked flights to send for payment calculation
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
                body: JSON.stringify({ 
                    bookedFlights, 
                    additionalCheckedBags: parsedAdditionalCheckedBags,
                    additionalCheckedBagsReturn: parsedAdditionalCheckedBagsReturn
                }),
                })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        };

        loginCheck();
        fetchData();
    }, []);

    async function getBaggageFee(airline) { // fetch baggage fee from backend
        const cleanedAirline = (airline || '').trim();
        const response = await fetch(`http://localhost:3001/api/baggage-cost?airline=${encodeURIComponent(cleanedAirline)}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        return data.valid ? data.fee : null;
    }

    async function getReturnBaggageFee(airline) { // fetch baggage fee from backend
        const cleanedAirline = (airline || '').trim();
        const response = await fetch(`http://localhost:3001/api/baggage-cost?airline=${encodeURIComponent(cleanedAirline)}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        return data.valid ? data.fee : null;
    }

    useEffect(() => { // fetch baggage fee error handlimg
        const airline = tripData?.flights?.[0]?.airline?.trim();
        if (!airline) {
            setBaggageFee(50);
            return;
        }

        const loadFee = async () => {
            try {
                const fee = await getBaggageFee(airline);
                setBaggageFee(fee ?? 50);
            } catch (error) {
                console.error('Error fetching baggage fee:', error);
                setBaggageFee(50);
            }
        };

        loadFee();
    }, [tripData]);

    useEffect(() => { // fetch return-trip baggage fee error handling
        const airline = tripData?.flights?.[1]?.airline?.trim();
        if (!airline) {
            setReturnBaggageFee(50);
            return;
        }

        const loadFee = async () => {
            try {
                const fee = await getReturnBaggageFee(airline);
                setReturnBaggageFee(fee ?? 50);
            } catch (error) {
                console.error('Error fetching return baggage fee:', error);
                setReturnBaggageFee(50);
            }
        };

        loadFee();
    }, [tripData]);

    // Create HTML box with information about the flight and return it to be shown
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

    // helper function for getCheckedBaggageCount
    function getSeatClass(seatName, flight) { 
        const seatInfo = flight.seats.find(s => s.name === seatName);
        return seatInfo ? seatInfo.class : null;
    }

    // counting how many bags are included based on ticket type
    function getCheckedBaggageCount(flightIndex) {
        const flight = tripData?.flights?.[flightIndex];
        const selectedForFlight = selectedSeats[flightIndex] || [];
        if (!flight || selectedForFlight.length === 0) return 0;

        const seatClasses = selectedForFlight.map(seat => getSeatClass(seat, flight));
        return seatClasses.includes('firstClass') ? 2
            : seatClasses.includes('business') ? 1
            : 0;
    }

    function getFlightTotalPrice(flight, flightIndex) {
        let totalPrice = 0;
        const selectedForFlight = selectedSeats[flightIndex] || [];

        for (const seat of selectedForFlight) {
            const seatInfo = flight.seats.find(s => s.name === seat);
            if (seatInfo) {
                totalPrice += flight.price[seatInfo.class] || 0;
            }
        }
        return totalPrice;
    }

    function getAdditionalBagsForFlight(index) { // helper for getting additional bag count
        return index === 0 ? additionalCheckedBags : additionalCheckedBagsReturn;
    }

    function getBaggageFeeForFlight(index) { // helper for getting baggage fees
        return index === 0 ? baggageFee : returnBaggageFee;
    }

    function calculateTotalPrice(flights) {
        let totalPrice = 0;
        for (let index = 0; index < flights.length; index++) {
            totalPrice += getFlightTotalPrice(flights[index], index);
        }
        return totalPrice + (additionalCheckedBags * baggageFee) + (additionalCheckedBagsReturn * returnBaggageFee);
    }

    function getTotalPriceOfLevel(flight, level, flightIndex) {
        // find total price of seats selected for this flight and level
        let totalPrice = 0;
        const levelSeats = flight.seats.filter(s => s.class === level);
        const selectedForFlight = selectedSeats[flightIndex] || [];
        for (const seat of selectedForFlight) {
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
                <h3>Flights</h3>
                <hr></hr>
                {tripData.flights.map((flight, index) => {
                    const flightLabel = tripData.tripType === 'round-trip'
                        ? (index === 0 ? 'Outbound' : 'Return')
                        : `Flight ${index + 1}`;
                    const selectedForFlight = selectedSeats[index] || [];
                    const bagsForFlight = getAdditionalBagsForFlight(index);
                    const feeForFlight = getBaggageFeeForFlight(index); 
                    return (
                        <div key={index} className="flight-price-breakdown">
                            <h5>{flightLabel}: {flight.name}</h5>
                            <p>Economy (${flight.price.economy.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'economy', index).toFixed(2)}</p>
                            <p>Business (${flight.price.business.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'business', index).toFixed(2)}</p>
                            <p>First Class (${flight.price.firstClass.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'firstClass', index).toFixed(2)}</p>
                            <p>Additional Checked Bags: {bagsForFlight} x ${feeForFlight.toFixed(2)} = ${(bagsForFlight * feeForFlight).toFixed(2)}</p>
                            <p>Selected Seat(s): {selectedForFlight.join(', ') || 'None'}</p>
                            <p>Included Checked Bags: {getCheckedBaggageCount(index)}</p>
                            <hr></hr>
                        </div>
                    );
                })}
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

