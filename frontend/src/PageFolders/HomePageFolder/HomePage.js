import React, { useEffect, useState } from 'react';

export default function HomePage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [trip_type, setTripType] = useState('');
    const [departure_date, setDepartureDate] = useState('');
    const [return_date, setReturnDate] = useState('');
    const [traveller_count, setTravellerCount] = useState(1);

    const handleOriginChange = (e) => {setOrigin(e.target.value);}
    const handleDestinationChange = (e) => {setDestination(e.target.value);}
    const handleTripTypeChange = (e) => {setTripType(e.target.value);}
    const handleDepartureDateChange = (e) => {setDepartureDate(e.target.value);}
    const handleReturnDateChange = (e) => {setReturnDate(e.target.value);}
    const handleTravellerCountChange = (e) => {setTravellerCount(e.target.value);}

    function search() {
        // Store the search parameters in local storage and switch to the search page
        localStorage.setItem('origin', origin);
        localStorage.setItem('destination', destination);
        localStorage.setItem('trip_type', trip_type);
        localStorage.setItem('departure_date', departure_date);
        localStorage.setItem('return_date', return_date);
        localStorage.setItem('traveller_count', traveller_count);
        window.location.href = "/search";
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the home page where you can search for flights!</p>

            <div className="back-panel">
                <div className="log-in-nav-button" onClick={nav_to_login}>
                    <button >Log In</button>
                </div>

                <div className="origin-airport-input">
                    <p>From</p>
                    <input className="input-text" type="text" placeholder="Here" onChange={handleOriginChange} />
                </div>
                <div className="destination-airport-input">
                    <p>To</p>
                    <input className="input-text" type="text" placeholder="There" onChange={handleDestinationChange} />
                </div>

                <div className="trip-type-input">
                    <p>Trip Type</p>
                    <select className="input-select" onChange={handleTripTypeChange}>
                        <option value="one-way">One Way</option>
                        <option value="round-trip">Round Trip</option>
                    </select>
                </div>

                <div className="departure-date-input">
                    <p>Departure Date</p>
                    <input className="input-date" type="date" onChange={handleDepartureDateChange} />
                </div>
                <div className="return-date-input">
                    <p>Return Date</p>
                    <input className="input-date" type="date" onChange={handleReturnDateChange} />
                </div>
                <div className="traveller-count-input">
                    <p>Traveller Count</p>
                    <input className="input-number" type="number" min="1" defaultValue="1" onChange={handleTravellerCountChange} />
                </div>
                <div className="search-flights-button" onClick={search}>
                    <button>Search Flights</button>
                </div>
            </div>
        </div>
    );
}

function nav_to_login() {
    window.location.href = "/login";
}

