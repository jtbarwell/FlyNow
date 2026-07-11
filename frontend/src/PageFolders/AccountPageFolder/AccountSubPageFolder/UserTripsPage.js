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
                const serverTrips = data.data.trips || [];
                // compute client-side fallback for isCancelable (use browser time)
                const enriched = serverTrips.map(t => {
                    const clientIsCancelable = Array.isArray(t.flights) && t.flights.some(f => new Date(f.departureTime) > new Date());
                    return { ...t, isCancelable: !!t.isCancelable || clientIsCancelable };
                });
                setTrips(serverTrips);
                // DEBUG: log trips received from backend and after enrichment
                console.log('DEBUG: fetched trips (enriched)', enriched);
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

    const getTripStatus = (trip) => {
        if (trip.isCancelled) return 'Cancelled';
        if (trip.isCancelable) return 'Upcoming';
        return 'Past';
    };

    const viewDetails = (trip) => {
        localStorage.setItem('selectedTrip', JSON.stringify(trip));
        window.location.href = '/account/my-trips/flight-details';
    };

    const rebookTrip = () => {
        window.location.href = '/search';
    };

    const renderTripCard = (trip) => {
        const firstFlight = trip.flights[0];
        const lastFlight = trip.flights[trip.flights.length - 1];
        return (
            <div className="one-way-flight-result" key={trip.tripID}>
                <div className="object-panel">
                    <div className="flight-info">
                        <p>{trip.tripType === 'round-trip' ? 'Round Trip' : 'One-Way'} • {trip.travellerCount} Traveller{trip.travellerCount !== 1 ? 's' : ''}</p>
                        {trip.tripType === 'one-way' ? 
                            <h5>{firstFlight.origin} &rarr; {lastFlight.destination}</h5> : 
                            <h5>{firstFlight.origin} &rarr; {firstFlight.destination} &rarr; {lastFlight.destination}</h5>
                        }
                        <p>{formatDate(firstFlight.departureTime)}{trip.flights.length > 1 ? ` – ${formatDate(lastFlight.arrivalTime)}` : ''}</p>
                        <p style={{ marginTop: '8px', fontWeight: 'bold' }}>Status: {getTripStatus(trip)}</p>
                        <button className="btn btn-outline-secondary" onClick={() => viewDetails(trip)} style={{ marginTop: '12px' }}>
                            View Details
                        </button>
                        {trip.isCancelled && (
                            <button className="btn btn-outline-primary" onClick={rebookTrip} style={{ marginTop: '12px', marginLeft: '12px' }}>
                                Rebook
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const upcomingTrips = trips.filter(trip => trip.isCancelable && !trip.isCancelled);
    const pastTrips = trips.filter(trip => !trip.isCancelable && !trip.isCancelled);
    const cancelledTrips = trips.filter(trip => trip.isCancelled);

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the search page where you can see all the flights that match your searches!</p>
            <div className="back-button" onClick={() => nav_to_account()}>
                <button className="btn btn-outline-secondary" style={marginStyle}>Back</button>
            </div>

            <div className="back-panel">
                {loading && <p>Loading your trips...</p>}
                {!loading && error && <p>{error}</p>}
                {!loading && !error && trips.length > 0 && (
                    <>
                        {upcomingTrips.length > 0 && (
                            <div className="search-results">
                                <h2>Upcoming Trips</h2>
                                {upcomingTrips.map(renderTripCard)}
                            </div>
                        )}
                        {pastTrips.length > 0 && (
                            <div className="search-results" style={{ marginTop: '24px' }}>
                                <h2>Past Trips</h2>
                                {pastTrips.map(renderTripCard)}
                            </div>
                        )}
                        {cancelledTrips.length > 0 && (
                            <div className="search-results" style={{ marginTop: '24px' }}>
                                <h2>Cancelled Trips</h2>
                                {cancelledTrips.map(renderTripCard)}
                            </div>
                        )}
                        {upcomingTrips.length === 0 && pastTrips.length === 0 && cancelledTrips.length === 0 && (
                            <p>No trips found in your trip history.</p>
                        )}
                    </>
                )}
                {!loading && !error && trips.length === 0 && (
                    <p>No trips found in your trip history. loading: {loading.toString()}, error: {error}, trips: {trips.length}</p>
                )}
            </div>
        </div>
    );
}

function nav_to_account()      { window.location.href = "/account"; }
