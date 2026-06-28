import React, { useEffect, useState } from 'react';

export default function UserTripsPage() {

    const marginStyle = {
        margin: '18px 0'
    };

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the search page where you can see all the flights that match your searches!</p>
            <div className="back-button" onClick={nav_to_account}>
                <button class="btn btn-outline-secondary" style={marginStyle}>Back</button>
            </div>
            
            <div className="back-panel">
                <div className="search-results">
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
