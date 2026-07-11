import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [flights, setFlights] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [flightName, setFlightName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [economyPrice, setEconomyPrice] = useState('');
  const [businessPrice, setBusinessPrice] = useState('');
  const [firstClassPrice, setFirstClassPrice] = useState('');
  const [message, setMessage] = useState('');
  const [passengers, setPassengers] = useState([]);
  const navigate = useNavigate();

  const loadFlights = async () => {
    const response = await fetch('http://localhost:3001/api/admin/flights', {
      credentials: 'include'
    });
    const data = await response.json();
    if (data.valid === false) {
      navigate('/admin/login');
      return;
    }
    setFlights(data.flights || []);
    if (data.flights?.[0]) {
      setSelectedFlightId(String(data.flights[0].flightID));
      populateForm(data.flights[0]);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const populateForm = (flight) => {
    setFlightName(flight.name || '');
    setOrigin(flight.origin || '');
    setDestination(flight.destination || '');
    setDepartureTime(flight.departureTime || '');
    setArrivalTime(flight.arrivalTime || '');
    setEconomyPrice(flight.price?.economy ?? '');
    setBusinessPrice(flight.price?.business ?? '');
    setFirstClassPrice(flight.price?.firstClass ?? '');
  };

  const handleFlightSelect = (event) => {
    const id = event.target.value;
    setSelectedFlightId(id);
    const flight = flights.find((item) => String(item.flightID) === id);
    if (flight) populateForm(flight);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:3001/api/admin/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        flightID: Number(selectedFlightId),
        name: flightName,
        origin,
        destination,
        departureTime,
        arrivalTime,
        price: {
          economy: Number(economyPrice),
          business: Number(businessPrice),
          firstClass: Number(firstClassPrice)
        }
      })
    });
    const data = await response.json();
    setMessage(data.message || 'Flight updated');
    loadFlights();
  };

  const handleCreate = async () => {
    const response = await fetch('http://localhost:3001/api/admin/flights/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: flightName,
        origin,
        destination,
        departureTime,
        arrivalTime,
        price: {
          economy: Number(economyPrice),
          business: Number(businessPrice),
          firstClass: Number(firstClassPrice)
        }
      })
    });
    const data = await response.json();
    setMessage(data.message || 'New flight created');
    loadFlights();
  };

  const handleDelete = async () => {
    const response = await fetch(`http://localhost:3001/api/admin/flights/${selectedFlightId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await response.json();
    setMessage(data.message || 'Flight removed');
    loadFlights();
  };

  const handleViewPassengers = async (flightID) => {
    const response = await fetch(`http://localhost:3001/api/admin/flights/${flightID}/passengers`, {
      credentials: 'include'
    });
    const data = await response.json();
    if (data.valid === false) {
      navigate('/admin/login');
      return;
    }
    setPassengers(data.body.passengerList || []);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#fff' }}>
      <div className="text-center" style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '2rem', border: '1px solid #ece8f3' }}>
        <h2 style={{ fontWeight: 500, color: '#444', marginBottom: '0.5rem' }}>Admin Dashboard</h2>
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>Manage flight schedules, pricing, and passenger lists.</p>
        {message ? <div style={{ background: '#e6dfef', color: '#333', padding: '0.8rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>{message}</div> : null}

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: '#fafafa', padding: '1.3rem', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
          <h3>Flight Management</h3>
          <label style={{ display: 'block', marginBottom: 8 }}>Select flight</label>
          <select value={selectedFlightId} onChange={handleFlightSelect} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }}>
            {flights.map((flight) => (
              <option key={flight.flightID} value={flight.flightID}>{flight.name}</option>
            ))}
          </select>

          <form onSubmit={handleSave} style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <label>Flight name</label>
              <input value={flightName} onChange={(e) => setFlightName(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} />
            </div>
            <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: '1fr 1fr' }}>
              <div><label>Origin</label><input value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
              <div><label>Destination</label><input value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
            </div>
            <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: '1fr 1fr', marginTop: '0.8rem' }}>
              <div><label>Departure</label><input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
              <div><label>Arrival</label><input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
            </div>
            <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: '1fr 1fr 1fr', marginTop: '0.8rem' }}>
              <div><label>Economy</label><input type="number" value={economyPrice} onChange={(e) => setEconomyPrice(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
              <div><label>Business</label><input type="number" value={businessPrice} onChange={(e) => setBusinessPrice(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
              <div><label>First Class</label><input type="number" value={firstClassPrice} onChange={(e) => setFirstClassPrice(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.8rem', border: 'none', borderRadius: 8, background: '#e6dfef', color: '#333', cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={handleCreate} style={{ flex: 1, padding: '0.8rem', border: 'none', borderRadius: 8, background: '#e6dfef', color: '#333', cursor: 'pointer' }}>Create New</button>
              <button type="button" onClick={handleDelete} style={{ flex: 1, padding: '0.8rem', border: 'none', borderRadius: 8, background: '#e6dfef', color: '#333', cursor: 'pointer' }}>Delete</button>
            </div>
          </form>
        </div>

        <div style={{ background: '#fafafa', padding: '1.3rem', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
          <h3>Passenger List</h3>
          <p>Select a flight to view passengers checked in or booked.</p>
          <select value={selectedFlightId} onChange={handleFlightSelect} style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #d8c9ea', background: '#f3ebfa', marginBottom: '0.8rem' }}>
            {flights.map((flight) => (
              <option key={flight.flightID} value={flight.flightID}>{flight.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleViewPassengers(selectedFlightId)} style={{ width: '100%', padding: '0.8rem', border: 'none', borderRadius: 8, background: '#e6dfef', color: '#333', cursor: 'pointer' }}>
            Load Passenger List
          </button>

          <div style={{ marginTop: '1rem' }}>
            {passengers.length === 0 ? (
              <p style={{ color: '#666' }}>No passengers loaded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {passengers.map((passenger) => {
                  const displayName = passenger.firstName || passenger.email || 'Passenger';
                  const avatarUrl = `https://avatars.dicebear.com/api/initials/${encodeURIComponent(displayName)}.svg`;
                  return (
                    <div key={`${passenger.bookingID || displayName}-${passenger.seat || 'NA'}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: '#fff', borderRadius: 10, border: '1px solid #efe7ef' }}>
                      <img src={avatarUrl} alt={displayName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{displayName}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{passenger.seat ? `Seat ${passenger.seat}` : ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
