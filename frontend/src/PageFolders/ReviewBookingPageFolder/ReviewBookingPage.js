import React, { useEffect, useState } from 'react';

export default function ReviewBookingPage() {
    const [tripData, setTripData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [additionalCheckedBags, setAdditionalCheckedBags] = useState(0);
    const [baggageFee, setBaggageFee] = useState(50);
    const [additionalCheckedBagsReturn, setAdditionalCheckedBagsReturn] = useState(0);
    const [returnBaggageFee, setReturnBaggageFee] = useState(50);


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
            if (savedTripData) {setTripData(JSON.parse(savedTripData));}
            const savedSelectedSeats = localStorage.getItem('selectedSeats');
            if (savedSelectedSeats) {setSelectedSeats(JSON.parse(savedSelectedSeats));}
            const savedAdditionalCheckedBags = localStorage.getItem('additionalCheckedBags');
            if (savedAdditionalCheckedBags) {setAdditionalCheckedBags(parseInt(savedAdditionalCheckedBags));}
            const savedAdditionalCheckedBagsReturn = localStorage.getItem('additionalCheckedBagsReturn');
            if (savedAdditionalCheckedBagsReturn) {setAdditionalCheckedBagsReturn(parseInt(savedAdditionalCheckedBagsReturn));}
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

    async function checkout() {
        try {
            // Send the booking data to the backend for processing
            const bookedFlights = [];
            for (let i = 0; i < tripData.flights.length; i++) {
                bookedFlights.push(
                    {
                        flightID: tripData.flights[i].flightID,
                        seats: selectedSeats[i]
                    });
            };
            const payload = {
              tripType: tripData.tripType,
              travellerCount: tripData.travellerCount,
              bookedFlights,
              additionalCheckedBags
            };
            
            const res = await fetch("http://localhost:3001/api/bookingConfirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (!data) {
                console.error('Booking failed:', data);
                alert('Booking failed. Please try again.');
                return;
            }
            // Debugging
            console.log("Booking confirmed:", data);
            // Redirect to confirmation page
            window.location.href = "/confirm-booking";
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the review booking page where you can review all the information of your selected trip and checkout.</p>

            <div className="back-panel">
                <div className="booking-menu">
                    <h2>Review Your Booking Information</h2>
                    <hr></hr>
                    <h3>{tripData?.airlines.join(' + ')}</h3>
                    <h4 className="to-uppercase">{tripData?.origin} &rarr; {tripData?.destination}</h4>
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

                    <h5>Select payment method</h5>
                    <div className="payment-method-input">
                        <select>
                            <option>Credit Card</option>
                            <option>Debit Card</option>
                            <option>PayPal</option>
                        </select>
                    </div>

                    <br></br>

                    <div className="checkout-button" onClick={checkout}>
                        <button>Checkout</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

