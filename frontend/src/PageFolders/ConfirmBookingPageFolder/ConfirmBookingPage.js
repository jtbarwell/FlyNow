import React, { useEffect, useState } from 'react';

export default function ConfirmBookingPage() {
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
        const fetchData = async () => {
            const savedTripData = localStorage.getItem('tripData');
            if (savedTripData) {setTripData(JSON.parse(savedTripData));}
            const savedSelectedSeats = localStorage.getItem('selectedSeats');
            if (savedSelectedSeats) {setSelectedSeats(JSON.parse(savedSelectedSeats));}
            const savedAdditionalCheckedBags = localStorage.getItem('additionalCheckedBags');
            if (savedAdditionalCheckedBags) {setAdditionalCheckedBags(parseInt(savedAdditionalCheckedBags));}
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

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the booking page where you can see all the flight information of your selected trips!</p>

            <h1>Flight Booked Successfully!</h1>

            <br></br>

            <div className="back-panel">
                <div className="booking-menu">
                    <h3>{tripData?.airlines.join(" + ")}</h3>
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

                    <div className="return-to-home-button" onClick={navToHome}>
                        <button>Return to Search</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function navToHome() {
    window.location.href = "/";
}
