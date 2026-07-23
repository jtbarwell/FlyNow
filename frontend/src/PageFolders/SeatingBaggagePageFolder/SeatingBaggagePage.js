import React, { useEffect, useState } from 'react';

export default function SeatingBaggagePage() {
    const [tripData, setTripData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [additionalCheckedBags, setAdditionalCheckedBags] = useState(0);
    const [additionalCheckedBagsReturn, setAdditionalCheckedBagsReturn] = useState(0);
    const [baggageFee, setBaggageFee] = useState(50);
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
        const fetchTripData = async () => { // save trip data to local storage
            const savedTripData = localStorage.getItem('tripData');
            if (savedTripData) {setTripData(JSON.parse(savedTripData));}

            const savedSelectedSeats = localStorage.getItem('selectedSeats');
            if (savedSelectedSeats) {setSelectedSeats(JSON.parse(savedSelectedSeats));}

            const savedAdditionalCheckedBags = localStorage.getItem('additionalCheckedBags');
            if (savedAdditionalCheckedBags !== null) {setAdditionalCheckedBags(parseInt(savedAdditionalCheckedBags, 10) || 0);}

            const savedAdditionalCheckedBagsReturn = localStorage.getItem('additionalCheckedBagsReturn');
            if (savedAdditionalCheckedBagsReturn !== null) {setAdditionalCheckedBagsReturn(parseInt(savedAdditionalCheckedBagsReturn, 10) || 0);}
        };

        loginCheck();
        fetchTripData();
    }, []);

    const handleSeatSelection = (flightIndex, seats) => { 
        // Update the selected seats for the specific flight
        // [[A3, B2], [C1, D4]]
        setSelectedSeats((prevSelectedSeats) => {
            const updatedSeats = [...(prevSelectedSeats || [])];
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

    // Save chosen seats and bags then navigate to review booking
    function navToReviewBooking() {
        if (!validSeatSelection()) {return;}
        localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        localStorage.setItem('additionalCheckedBags', additionalCheckedBags);
        localStorage.setItem('additionalCheckedBagsReturn', additionalCheckedBagsReturn);
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

    // pricing for checked bags
    async function getBaggageFee(airline) { 
        const response = await fetch(`/api/baggage-cost?airline=${encodeURIComponent(airline)}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        return data.valid ? data.fee : null;
    }

    useEffect(() => { // fetch baggage fee for departure
        const airline = tripData?.flights?.[0]?.airline;
        if (!airline) {
            setBaggageFee(50);
            return;
        }
        const loadBaggageFee = async () => {
            try {
                console.log('Fetching baggage fee for airline:', airline);
                const fee = await getBaggageFee(airline);
                console.log('Baggage fee response:', fee);
                setBaggageFee(fee ?? 50);
            } catch (error) {
                console.error('Error fetching baggage fee:', error);
                setBaggageFee(50);
            }
        };
        loadBaggageFee();
    }, [tripData]);

    useEffect(() => { // fetch baggage fee for return
        const airline = tripData?.flights?.[1]?.airline;
        if (!airline) {
            setReturnBaggageFee(50);
            return;
        }
        const loadReturnBaggageFee = async () => {
            try {
                console.log('Fetching baggage fee for airline:', airline);
                const fee = await getBaggageFee(airline);
                console.log('Baggage fee response:', fee);
                setReturnBaggageFee(fee ?? 50);
            } catch (error) {
                console.error('Error fetching baggage fee:', error);
                setReturnBaggageFee(50);
            }
        };
        loadReturnBaggageFee();
    }, [tripData]);

    // function variableBaggageCost() {
    //     let fee = 50;
    //     // based on selected flight airline, change the cost per additional checked bag
    //     switch (tripData.flights[0].airline) {
    //         case "Air Canada":
    //             fee = 60;
    //             break;
    //         case "WestJet":
    //             fee = 85;
    //             break;
    //         case "Delta Airlines":
    //             fee = 55;
    //             break;
    //         default:
    //             fee = 50;
    //     }
    //     return fee;
    // }

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
        return totalPrice + (additionalCheckedBags * baggageFee)+ (additionalCheckedBagsReturn * returnBaggageFee); 
    }

    // helper function for getCheckedBaggageCount
    function getSeatClass(seatName, flight) { 
        const seatInfo = flight.seats.find(s => s.name === seatName);
        return seatInfo ? seatInfo.class : null;
    }

    // 2 for firstClass, 1 for business, 0 for economy

    function getCheckedBaggageCount(flightIndex = 0) {
        const flight = tripData?.flights?.[flightIndex];
        const seats = selectedSeats[flightIndex] || [];

        if (!flight || seats.length === 0) return 0;

        const seatClasses = seats.map(seat => getSeatClass(seat, flight));

        if (seatClasses.includes('firstClass')) return 2;
        if (seatClasses.includes('business')) return 1;
        return 0;
    }

    function SeatingAndBaggageMenu() {
        if (!tripData) {
            return <p>Loading trip data...</p>;
        }

        const checkedBaggageCost = baggageFee;
        const returnCheckedBaggageCost = returnBaggageFee;
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
<hr></hr>
                <h2>Step 2: Baggage Options</h2>
                <u><h4>Included Items:</h4></u>
                <h5>Personal item: ✓</h5>
                <h5>Carry-on bag: ✓</h5>
                <h5>Checked Bags Per Traveller: {getCheckedBaggageCount(0)}</h5> 
                <br></br>
                <h4>Additional Baggage:</h4> 
                <label htmlFor="additional-checked-bags">${(checkedBaggageCost)} each</label>
                <input className="input-number" type="number" id="additional-checked-bags" min="0" placeholder="Enter number of additional checked bags" value={additionalCheckedBags} onChange={(e) => setAdditionalCheckedBags(parseInt(e.target.value) || 0)}></input>
                <p>+${ (additionalCheckedBags * checkedBaggageCost).toFixed(2) }</p>
                {tripData?.tripType === 'round-trip' && (
                    <div>
                        <hr></hr>
                        <u><h4>Return Trip Included Items:</h4></u>
                        <h5>Personal item: ✓</h5>
                        <h5>Carry-on bag: ✓</h5>
                        <h5>Checked Bags Per Traveller: {getCheckedBaggageCount(1)}</h5> 
                        <br></br>
                        <h4>Return Trip Additional Baggage:</h4> 
                        <label htmlFor="additional-checked-bags-return">${(returnCheckedBaggageCost)} each</label>
                        <input className="input-number" type="number" id="additional-checked-bags-return" min="0" placeholder="Enter number of additional checked bags for return flight" value={additionalCheckedBagsReturn} onChange={(e) => setAdditionalCheckedBagsReturn(parseInt(e.target.value) || 0)}></input>
                        <p>+${ (additionalCheckedBagsReturn * returnBaggageFee).toFixed(2) }</p>
                    </div>
                )}
                

                <div className="trip-price">
                    <hr></hr>
                    <h4>${calculateTotalPrice(tripData?.flights).toFixed(2)}</h4>
                    <hr></hr>
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