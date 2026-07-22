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
            alert(`Reservation cancelled successfully: ${data.cancelledBookingID}`);
            localStorage.removeItem('selectedTrip');
            window.location.href = '/account/my-trips';
        } catch (err) {
            alert('Unable to cancel reservation. Please try again later.');
        }
    };

    if (trip) {
        return (
            <div className="text-center">
                <div className="back-panel">
                    <div className="booking-menu">
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
                                    <p>Seat(s): {flight.seats.join(', ')}</p>
                                </div>
                            </div>
                        ))}
                        {trip.additionalCheckedBags > 0 && (
                            <p style={{ textAlign: 'left' }}>Additional checked bags: {trip.additionalCheckedBags}</p>
                        )}

                        {trip.finalPrice !== undefined && (
                            <p style={{ textAlign: 'left' }}>
                                Total Paid: ${trip.finalPrice.toFixed(2)}
                                {trip.pointsRedeemed > 0 ? ` (redeemed ${trip.pointsRedeemed.toLocaleString()} pts for -$${trip.discount.toFixed(2)})` : ''}
                                {trip.pointsEarned > 0 ? ` — earned ${trip.pointsEarned.toLocaleString()} pts` : ''}
                            </p>
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
                                <button className="btn btn-danger" onClick={() => cancelReservation(trip)} style={marginStyle}>Cancel Reservation</button>
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