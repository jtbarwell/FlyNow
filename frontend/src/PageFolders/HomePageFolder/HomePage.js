import React, { useEffect, useState } from 'react';

export default function HomePage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [trip_type, setTripType] = useState('one-way');
    const [departure_date, setDepartureDate] = useState('');
    const [return_date, setReturnDate] = useState('');
    const [traveller_count, setTravellerCount] = useState(1);

    const handleOriginChange = (e) => {setOrigin(e.target.value);}
    const handleDestinationChange = (e) => {setDestination(e.target.value);}
    const handleTripTypeChange = (e) => {setTripType(e.target.value);}
    const handleDepartureDateChange = (e) => {setDepartureDate(e.target.value);}
    const handleReturnDateChange = (e) => {setReturnDate(e.target.value);}
    const handleTravellerCountChange = (e) => {setTravellerCount(e.target.value);}

    const marginStyle = { margin: '15px 0' };

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

            <div className="back-panel">
                <div className="action-button" onClick={nav_to_login}>
                    <button style={marginStyle}>Log In</button>
                </div>
                <div className="action-button" onClick={nav_to_signup}>
                    <button style={marginStyle}>Sign Up</button>
                </div>
            </div>
        </div>
    );
}

function nav_to_login() {
    window.location.href = "/login";
}

function nav_to_signup() {
    window.location.href = "/signup";
}