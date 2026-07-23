import React, { useEffect, useState } from 'react';

export default function UserFlightDetailsPage() {
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const marginStyle = {
        margin: '5px 0'
    };

    useEffect(() => {
        const savedTrip = localStorage.getItem('selectedTrip');
        if (savedTrip) {
            const parsed = JSON.parse(savedTrip);
            const clientIsCancelable = Array.isArray(parsed.flights) && parsed.flights.some(f => new Date(f.departureTime) > new Date());
            setTrip({ ...parsed, isCancelable: !!parsed.isCancelable || clientIsCancelable });
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

    const getTripStatus = (trip) => {
        if (trip.isCancelled) return 'Cancelled';
        if (trip.flights.some(f => f.isCancelled)) return 'Partially Cancelled';
        if (trip.isCancelable) return 'Upcoming';
        return 'Past';
    };

    const rebookTrip = () => {
        window.location.href = '/search';
    };

    const cancelReservation = async (trip) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/cancel-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ bookingID: trip.tripID })
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data?.error || 'Failed to cancel reservation.');
                return;
            }
            const data = await response.json();
            alert(`Reservation cancelled successfully. Refund due: $${data.refundAmount.toFixed(2)}`);
            localStorage.removeItem('selectedTrip');
            window.location.href = '/account/my-trips';
        } catch (err) {
            alert('Unable to cancel reservation. Please try again later.');
        }
    };

    const cancelTraveller = async (trip, travellerIndex, flightID) => {
        const t = trip.travellers?.[travellerIndex];
        const label = (t && t.firstName) ? `${t.firstName} ${t.lastName}` : `Traveller ${travellerIndex + 1}`;
        const scope = (typeof flightID === 'number')
            ? 'their seat on this flight will be released'
            : 'their seat(s) on all upcoming flights will be released';
        if (!window.confirm(`Are you sure you want to cancel ${label}? ${scope}.`)) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/cancel-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ bookingID: trip.tripID, travellerIndex, flightID })
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data?.error || 'Failed to cancel traveller.');
                return;
            }
            const data = await response.json();
            alert(`${label} cancelled successfully. Refund due: $${data.refundAmount.toFixed(2)}`);
            localStorage.removeItem('selectedTrip');
            window.location.href = '/account/my-trips';
        } catch (err) {
            alert('Unable to cancel traveller. Please try again later.');
        }
    };

    const activeTravellerCount = (trip) => {
        if (!Array.isArray(trip.travellers) || trip.travellers.length === 0) { return trip.travellerCount; }
        return trip.travellers.filter(t => !t?.isCancelled).length;
    };

    const cancelLeg = async (trip, flight) => {
        if (!window.confirm(`Are you sure you want to cancel flight ${flight.name} (${flight.origin} → ${flight.destination})? Your other flight(s) will be kept.`)) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/cancel-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ bookingID: trip.tripID, flightID: flight.flightID })
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data?.error || 'Failed to cancel flight.');
                return;
            }
            const data = await response.json();
            alert(`Flight cancelled successfully. Refund due: $${data.refundAmount.toFixed(2)}`);
            localStorage.removeItem('selectedTrip');
            window.location.href = '/account/my-trips';
        } catch (err) {
            alert('Unable to cancel flight. Please try again later.');
        }
    };

    const legIsCancelable = (flight) => {
        return !flight.isCancelled && new Date(flight.departureTime) > new Date();
    };

    if (trip) {
        return (
            <div className="text-center">
                <div className="back-panel">
                    <div className="booking-menu" style={editMode ? { border: '2px solid #4a90d9' } : {}}>
                        <h3>{trip.tripType === 'round-trip' ? 'Round Trip' : 'Single Trip'}</h3>
                        {trip.tripType === 'one-way' ? 
                            <h4>{trip.flights[0]?.origin} &rarr; {trip.flights[trip.flights.length - 1]?.destination}</h4> : 
                            <h4>{trip.flights[0]?.origin} &rarr; {trip.flights[0]?.destination} &rarr; {trip.flights[trip.flights.length - 1]?.destination}</h4>
                        }
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
                                    <p>Seat(s): {flight.seats.filter(Boolean).join(', ') || 'None'}</p>
                                    {editMode && trip.tripType === 'round-trip' && !trip.isCancelled && legIsCancelable(flight) && Array.isArray(trip.travellers) && trip.travellers.length > 0 && (
                                        <div style={{ marginBottom: '6px' }}>
                                            {trip.travellers.map((traveller, tIndex) => (
                                                !traveller.isCancelled && flight.seats[tIndex] && (
                                                    <button key={tIndex} className="btn btn-outline-secondary" onClick={() => cancelTraveller(trip, tIndex, flight.flightID)} style={{ marginRight: '6px' }}>
                                                        Remove {traveller.firstName || `Traveller ${tIndex + 1}`}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    )}
                                    {flight.isCancelled && (
                                        <p style={{ color: '#8a2b06' }}>This flight has been cancelled.</p>
                                    )}
                                    {editMode && trip.tripType === 'round-trip' && !trip.isCancelled && legIsCancelable(flight) && (
                                        <button className="btn btn-outline-danger" onClick={() => cancelLeg(trip, flight)} style={marginStyle}>
                                            Cancel Flight
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {Array.isArray(trip.travellers) && trip.travellers.length > 0 && (
                            <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                                <h5>Travellers</h5>
                                {trip.travellers.map((traveller, index) => (
                                    <div key={index} style={{ marginBottom: '6px' }}>
                                        <span>
                                            {traveller.firstName} {traveller.lastName}
                                            {traveller.isCancelled ? ' (cancelled)' : ''}
                                        </span>
                                        {editMode && !traveller.isCancelled && trip.isCancelable && !trip.isCancelled && activeTravellerCount(trip) > 1 && (
                                            <button className="btn btn-outline-danger" onClick={() => cancelTraveller(trip, index)} style={{ marginLeft: '10px' }}>
                                                Cancel Traveller
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {trip.additionalCheckedBags > 0 && (
                            <p style={{ textAlign: 'left' }}>Additional checked bags: {trip.additionalCheckedBags}</p>
                        )}
                        <p style={{ textAlign: 'left', fontWeight: 'bold' }}>Status: {getTripStatus(trip)}</p>
                        {trip.isCancelled && (
                            <p style={{ textAlign: 'left', color: '#8a2b06' }}>This reservation has already been cancelled.</p>
                        )}
                        {!trip.isCancelled && !trip.isCancelable && (
                            <p style={{ textAlign: 'left', color: '#8a2b06' }}>This reservation cannot be cancelled because it includes past travel.</p>
                        )}
                        <div className="back-button" onClick={nav_to_my_trips}>
                            <button className="btn btn-outline-secondary" style={marginStyle}>Back</button>
                        </div>
                        {trip.isCancelable && !trip.isCancelled && (
                            <div className="back-button" style={{ marginTop: '12px' }}>
                                <button className="btn btn-outline-secondary" onClick={() => setEditMode(!editMode)} style={marginStyle}>
                                    {editMode ? 'Done' : 'Edit Trip'}
                                </button>
                            </div>
                        )}
                        {trip.isCancelable && !trip.isCancelled && (
                            <div className="back-button" style={{ marginTop: '12px' }}>
                                <button className="btn btn-danger" onClick={() => cancelReservation(trip)} style={marginStyle}>
                                    {trip.flights.some(f => f.isCancelled) ? 'Cancel Remaining Flights' : 'Cancel Reservation'}
                                </button>
                            </div>
                        )}
                        {trip.isCancelled && (
                            <div className="back-button" style={{ marginTop: '12px' }}>
                                <button className="btn btn-outline-primary" onClick={rebookTrip} style={marginStyle}>Rebook</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="text-center">
        <div className="back-panel">
            <div className="booking-menu">
                <h3>Trip details unavailable</h3>
                <p>Please return to your trips and select an active reservation or cancelled booking.</p>
                <div className="back-button" onClick={nav_to_my_trips}>
                    <button className="btn btn-outline-secondary" style={marginStyle}>Back</button>
                </div>
            </div>
        </div>
    </div>
  );
}


function nav_to_my_trips()      { window.location.href = "/account/my-trips";       }
