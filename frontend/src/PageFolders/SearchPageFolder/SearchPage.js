import React, { useEffect, useState } from 'react';

export default function SearchPage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is the search page where you can see all the flights that match your searches!</p>

        <div className="back-panel">
            <div className ="search-menu">
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
            <div className="search-results">
                <h2>Search Results</h2>
                <p>Here you will see all the flights that match your search criteria!</p>
                
                <div className="round-trip-flight-result" onClick={nav_to_flight_booking}>
                    <div className="object-panel">
                        <div className="flight-info">
                            <p>Flight: AC317</p>
                            <h5>9:40 AM - 11:55 AM</h5>
                            <p>Direct</p>
                        </div>
                        <hr></hr>
                        <div className="flight-info">
                            <p>Flight: AC270 - AC318</p>
                            <h5>10:10 PM - 12:00 PM</h5>
                            <p>1-stop</p>
                        </div>
                        <div className="trip-price">
                            <p>$1790</p>
                        </div>
                    </div>
                </div>
                <br></br>
                <div className="one-way-flight-result" onClick={nav_to_flight_booking}>
                    <div className="object-panel">
                        <div className="flight-info">  
                            <p>Flight: AC317</p>
                            <h5>9:40 AM - 11:55 AM</h5>
                            <p>Direct</p>
                        </div>
                        <div className="trip-price">
                            <p>$920</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}

function nav_to_search() {
    window.location.href = "/search";
}

function nav_to_flight_booking() {
    window.location.href = "/flight-booking";
}