import React, { useEffect, useState } from 'react';

export default function UserFlightDetailsPage() {
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);

    const marginStyle = {
        margin: '5px 0'
    };

    useEffect(() => {
        const savedTrip = localStorage.getItem('selectedTrip');
        if (savedTrip) {
            setTrip(JSON.parse(savedTrip));
        } else {
            setError('No trip selected. Please choose a trip from the My Trips page.');
        }
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return 'Unknown date';
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (trip) {
        return (
            <div className="text-center">
                <div className="back-panel">
                    <div className="booking-menu">
                        <h3>{trip.tripType === 'round-trip' ? 'Round Trip' : 'Single Trip'}</h3>
                        <h4>{trip.flights[0]?.origin} &rarr; {trip.flights[trip.flights.length - 1]?.destination}</h4>
                        <p align="left">
                            {trip.travellerCount} Traveller{trip.travellerCount !== 1 ? 's' : ''}<br></br>
                            {trip.flights.length} Flight{trip.flights.length !== 1 ? 's' : ''}
                        </p>
                        {trip.flights.map((flight, index) => (
                            <div key={`${flight.flightID}-${index}`} className="log-in-nav-button" style={{ textAlign: 'left', marginBottom: '14px' }}>
                                <div className="flight-info">
                                    <h5>{flight.airline}: {flight.name}</h5>
                                    <p>{flight.origin} &rarr; {flight.destination}</p>
                                    <p>Depart {formatDate(flight.departureTime)}</p>
                                    <p>Arrive {formatDate(flight.arrivalTime)}</p>
                                    <p>Seat: {flight.seat}</p>
                                </div>
                            </div>
                        ))}
                        {trip.additionalCheckedBags > 0 && (
                            <p style={{ textAlign: 'left' }}>Additional checked bags: {trip.additionalCheckedBags}</p>
                        )}
                        <div className="back-button" onClick={nav_to_my_trips}>
                            <button className="btn btn-outline-secondary" style={marginStyle}>Back</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="text-center">

        <div className="back-panel">
            <div className="booking-menu">
                <h3>Air Canada: AC317</h3>
                <h4>YYZ &rarr; LAX</h4>
                <p align="left">
                    2 Travellers <br></br>
                    DEPARTURE - 9:40 AM, September 1, 2026
                    ARRIVAL - 11:55 AM, September 1, 2026
                </p>
                
                

                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Check in</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>View Traveller Information</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Choose or Change Seats</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Manage Baggage</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Change Your Flight</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Request a Refund</button>
                </div>

                <div className="back-button" onClick={nav_to_my_trips}>
                    <button class="btn btn-outline-secondary" style={marginStyle}>Back</button>
                </div>

            </div>
        </div>
    </div>
  );
}


function nav_to_my_trips()      { window.location.href = "/account/my-trips";       }