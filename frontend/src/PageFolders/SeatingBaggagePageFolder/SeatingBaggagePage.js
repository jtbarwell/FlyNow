import React, { useEffect, useState } from 'react';

export default function SeatingBaggagePage() {
    const [tripData, setTripData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [additionalCheckedBags, setAdditionalCheckedBags] = useState(0);

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
        const fetchTripData = async () => {
            const savedTripData = localStorage.getItem('tripData');
            if (savedTripData) {
                setTripData(JSON.parse(savedTripData));
            }

        };

        loginCheck();
        fetchTripData();
    }, []);

    const handleSeatSelection = (flightIndex, seats) => {
        // Update the selected seats for the specific flight
        // [[A3, B2], [C1, D4]]
        setSelectedSeats(() => {
            const updatedSeats = [...selectedSeats];
            updatedSeats[flightIndex] = seats;
            return updatedSeats;
        });
    };

    function renderFlightInfo(flight) {
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
                <p>Flight: {flight.name}</p>
            </div>
        );
    }

    function getAvailableSeats(seats) {
        if (!Array.isArray(seats)) return [];
        return seats.filter(seat => seat.booked === false);
    }

    function validSeatSelection() {
        for (let i = 0; i < tripData.flights.length; i++) {
            const selectedForFlight = selectedSeats[i] || [];
            if (selectedForFlight.length < tripData.travellerCount) {
                alert(`Please select ${tripData.travellerCount} seat(s) for flight ${i + 1}.`);
                return false;
            }
        }
        return true;
    }

    function navToReviewBooking() {
        if (!validSeatSelection()) {return;}
        localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        localStorage.setItem('additionalCheckedBags', additionalCheckedBags);
        window.location.href = "/review-booking";
    }

    function SeatSelectionMenu({ flight }) {
        if (!flight || !flight.seats) {
            return null;
        }
        const flightIndex = tripData.flights.indexOf(flight);
        const availableSeats = getAvailableSeats(flight.seats);
        const selectedForFlight = selectedSeats[flightIndex] || [];

        return (
            <div className="seat-selection-menu">
                <h5>Available Seats</h5>
                <div className="seat-options">
                    <select 
                        multiple
                        value={selectedForFlight} 
                        onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                        if (selectedOptions.length > tripData.travellerCount) {
                            alert(`You can only select up to ${tripData.travellerCount} seat(s).`);
                            return;
                        }
                        handleSeatSelection(flightIndex, selectedOptions);
                    }}>
                        {availableSeats.map((seat) => (
                            <option key={seat.name} value={seat.name}>
                                {seat.name} - ${flight.price[seat.class]?.toFixed(2) || 'N/A'}
                            </option>
                        ))}
                    </select>
                    <p>Selected Seats: {selectedForFlight.join(', ') || 'None'}</p>
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

    function SeatingAndBaggageMenu() {
        if (!tripData) {
            return <p>Loading trip data...</p>;
        }
        const includedCheckedBaggage = 1; // Example included checked baggage count
        const checkedBaggageCost = 50; // Example cost for checked baggage
        return (
            <div className="booking-menu">
                <h2>Step 1: Choose Your Seat{tripData?.travellerCount !== 1 ? 's' : ''}</h2>
                <h5>{tripData?.travellerCount} Traveller{tripData?.travellerCount !== 1 ? 's' : ''}</h5>
                
                {tripData?.tripType === 'round-trip' && tripData?.flights.length > 1 ? (
                    <div className="trip-list">
                        <div className="object-panel">
                            {renderFlightInfo(tripData?.flights[0])}
                            <hr></hr>
                            <SeatSelectionMenu flight={tripData?.flights[0]}></SeatSelectionMenu>
                        </div>
                        <br></br>
                        <div className="object-panel">
                            {renderFlightInfo(tripData?.flights[1])}
                            <hr></hr>
                            <SeatSelectionMenu flight={tripData?.flights[1]}></SeatSelectionMenu>
                        </div>
                    </div>
                ) : (
                    <div className="trip-list">
                        <div className="object-panel">
                            {renderFlightInfo(tripData?.flights[0])}
                            <hr></hr>
                            <SeatSelectionMenu flight={tripData?.flights[0]}></SeatSelectionMenu>
                        </div>
                    </div>
                )}

                <br></br>

                <h2>Step 2: Select Baggage Options</h2>

                <h5>Personal item: ✓</h5>
                <h5>Carry-on bag: ✓</h5>
                {includedCheckedBaggage ? <h5>{includedCheckedBaggage} checked baggage included per traveller</h5> : ""}
                <label htmlFor="additional-checked-bags">Additional Checked Bags:</label>
                <input className="input-number" type="number" id="additional-checked-bags" min="0" placeholder="Enter number of additional checked bags" value={additionalCheckedBags} onChange={(e) => setAdditionalCheckedBags(parseInt(e.target.value) || 0)}></input>

                <p>+${ (additionalCheckedBags * checkedBaggageCost).toFixed(2) }</p>

                <div className="trip-price">
                    <h4>${calculateTotalPrice(tripData?.flights).toFixed(2)}</h4>
                </div>
                
                <br></br>

                <div className="continue-booking-button" onClick={navToReviewBooking}>
                    <button>Continue</button>
                </div>

            </div>
        )
    }
    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the seating and baggage booking page where you can choose seats and select baggage options for your selected trip!</p>

            <div className="back-panel">
                <SeatingAndBaggageMenu></SeatingAndBaggageMenu>
            </div>
        </div>
    );
}