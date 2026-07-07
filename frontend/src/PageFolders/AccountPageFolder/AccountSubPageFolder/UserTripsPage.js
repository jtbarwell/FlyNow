import React, { useEffect, useState } from 'react';

export default function UserTripsPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const marginStyle = {
        margin: '18px 0'
    };

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/my-trips', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    const message = response.status === 401 ? 'Please log in to view your trips.' : 'Unable to load trips.';
                    setError(message);
                    return;
                }

                const data = await response.json();
                setTrips(data.trips || []);
            } catch (err) {
                setError('Failed to retrieve trip history.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
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

    const viewDetails = (trip) => {
        localStorage.setItem('selectedTrip', JSON.stringify(trip));
        window.location.href = '/account/my-trips/flight-details';
    };

    const renderTripCard = (trip) => {
        const firstFlight = trip.flights[0];
        const lastFlight = trip.flights[trip.flights.length - 1];
        return (
            <div className="one-way-flight-result" key={trip.tripID}>
                <div className="object-panel">
                    <div className="flight-info">
                        <p>{trip.tripType === 'round-trip' ? 'Round Trip' : 'One-Way'} • {trip.travellerCount} Traveller{trip.travellerCount !== 1 ? 's' : ''}</p>
                        <h5>{firstFlight.origin} &rarr; {lastFlight.destination}</h5>
                        <p>{formatDate(firstFlight.departureTime)}{trip.flights.length > 1 ? ` – ${formatDate(lastFlight.arrivalTime)}` : ''}</p>
                        <button className="btn btn-outline-secondary" onClick={() => viewDetails(trip)} style={{ marginTop: '12px' }}>
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const roundTrips = trips.filter(trip => trip.tripType === 'round-trip');
    const singleTrips = trips.filter(trip => trip.tripType === 'one-way');

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the search page where you can see all the flights that match your searches!</p>
            <div className="back-button" onClick={nav_to_account}>
                <button className="btn btn-outline-secondary" style={marginStyle}>Back</button>
            </div>

            <div className="back-panel">
                {loading && <p>Loading your trips...</p>}
                {!loading && error && <p>{error}</p>}
                {!loading && !error && trips.length > 0 && (
                    <>
                        {roundTrips.length > 0 && (
                            <div className="search-results">
                                <h2>Round Trips</h2>
                                {roundTrips.map(renderTripCard)}
                            </div>
                        )}
                        {singleTrips.length > 0 && (
                            <div className="search-results" style={{ marginTop: '24px' }}>
                                <h2>Single Trips</h2>
                                {singleTrips.map(renderTripCard)}
                            </div>
                        )}
                    </>
                )}
                {!loading && !error && trips.length === 0 && (
                    <p>No trips found in your trip history. Below are the existing example cards.</p>
                )}

                <div className="search-results" style={{ marginTop: '24px' }}>
                    <h2>Upcoming Flights</h2>
                    
                    <div className="round-trip-flight-result">
                        <div className="object-panel">
                            <div className="flight-info" onClick={nav_to_details}>
                                <p>Flight: AC317</p>
                                <h5>LAX &rarr; YYZ</h5>
                                <p>September 8, 2026</p>
                            </div>
                            <hr></hr>
                            <div className="flight-info" onClick={nav_to_details}>
                                <p>Flight: AC317</p>
                                <h5>YYZ &rarr; LAX</h5>
                                <p>September 1, 2026</p>
                            </div>
                        </div>
                    </div>
                    <br></br>

                    <h2>Past Flights</h2>
                    <div className="one-way-flight-result" onClick={nav_to_details}>
                        <div className="object-panel">
                            <div className="flight-info">  
                                <p>Flight: WJ2026</p>
                                <h5>PVG &rarr; YYZ</h5>
                                <p>March 2, 2026</p>
                            </div>
                        </div>
                    </div>
                    <div className="one-way-flight-result" onClick={nav_to_details}>
                        <div className="object-panel">
                            <div className="flight-info">  
                                <p>Flight: WJ2026</p>
                                <h5>YYZ &rarr; PVG</h5>
                                <p>February 3, 2026</p>
                            </div>
                        </div>
                    </div>
                    <div className="one-way-flight-result" onClick={nav_to_details}>
                        <div className="object-panel">
                            <div className="flight-info">  
                                <p>Flight: AC541</p>
                                <h5>SEA &rarr; YYZ</h5>
                                <p>July 5, 2025</p>
                            </div>
                        </div>
                    </div>
                    <div className="one-way-flight-result" onClick={nav_to_details}>
                        <div className="object-panel">
                            <div className="flight-info">  
                                <p>Flight: AC541</p>
                                <h5>YYZ &rarr; SEA</h5>
                                <p>June 27, 2025</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function nav_to_details() {
    window.location.href = "/account/my-trips/flight-details";
}
function nav_to_account()      { window.location.href = "/account";       }
