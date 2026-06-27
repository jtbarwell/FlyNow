import React, { useEffect, useState } from 'react';

export default function HomePage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is the home page where you can search for flights!</p>

        <div className="back-panel">
            <div className="log-in-nav-button" onClick={nav_to_login}>
                <button >Log In</button>
            </div>

            <div className="start-airport-input">
                <p>From</p>
                <input type="text" placeholder="Here" />
            </div>
            <div className="destination-airport-input">
                <p>To</p>
                <input type="text" placeholder="There" />
            </div>

            <div className="trip-type-input">
                <p>Trip Type</p>
                <select>
                    <option>One Way</option>
                    <option>Round Trip</option>
                </select>
            </div>

            <div className="departure-date-input">
                <p>Departure Date</p>
                <input type="date"/>
            </div>
            <div className="return-date-input">
                <p>Return Date</p>
                <input type="date"/>
            </div>
            <div className="traveller-count-input">
                <p>Traveller Count</p>
                <input type="number" min="1" defaultValue="1"/>
            </div>
            <div className="search-flights-button" onClick={nav_to_search}>
                <button>Search Flights</button>
            </div>
        </div>
    </div>
  );
}

function nav_to_login() {
    window.location.href = "/login";
}

function nav_to_search() {
    window.location.href = "/search";
}