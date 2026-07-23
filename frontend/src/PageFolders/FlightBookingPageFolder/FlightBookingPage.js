import React, { use, useEffect, useState } from 'react';

export default function FlightBookingPage() {
    const [tripData, setTripData] = useState(null);

    useEffect(() => {
        const fetchTripData = async () => {
            const savedTripData = localStorage.getItem('tripData');
            if (savedTripData) {
                setTripData(JSON.parse(savedTripData));
            }

        };

        fetchTripData();
    }, []);

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

    function calculateTotalPrice(flights) {
        let totalPrice = 0;
        for (const flight of flights) {
            totalPrice += flight.price.economy;
        }
        return totalPrice * (tripData?.travellerCount || 1);
    }

    function BookingMenu() {
        if (!tripData) {
            return <p>Loading trip data...</p>;
        }
        return (
            <div className="booking-menu">
                <h3>{tripData?.airlines.join(' + ')}</h3>
                <h4 className="to-uppercase">{tripData?.origin} &rarr; {tripData?.destination}</h4>
                <h5>{tripData?.tripType === 'one-way' ? 'One Way' : 'Round Trip'} - {tripData?.travellerCount} Traveller{tripData?.travellerCount !== 1 ? 's' : ''}</h5>
                
                {tripData?.tripType === 'round-trip' && tripData?.flights.length > 1 ? (
                    <div className="trip-list">
                        <div className="object-panel">
                            {renderFlightInfo(tripData?.flights[0])}
                        </div>
                        <br></br>
                        <div className="object-panel">
                            {renderFlightInfo(tripData?.flights[1])}
                        </div>
                    </div>
                ) : (
                    <div className="trip-list">
                        <div className="object-panel">
                            {renderFlightInfo(tripData?.flights[0])}
                        </div>
                    </div>
                )}

                <br></br>

                <div className="trip-price">
                    <h4>${calculateTotalPrice(tripData?.flights).toFixed(2)}</h4>
                </div>
                
                <br></br>

                <div className="action-button" onClick={navToTravellerDetails}>
                    <button>Continue</button>
                </div>

            </div>
        )
    }
    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the booking page where you can see all the flight information of your selected trip!</p>

            <div className="back-panel">
                <BookingMenu></BookingMenu>
            </div>
        </div>
    );
}

function navToTravellerDetails() {
    window.location.href = "/traveller-details";
}