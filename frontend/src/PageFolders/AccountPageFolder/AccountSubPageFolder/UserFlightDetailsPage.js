import React, { useEffect, useState } from 'react';

export default function UserFlightDetailsPage() {

    const marginStyle = {
        margin: '5px 0'
    };

  return (
    <div className="text-center">

        <div className="back-panel">
            <div className="booking-menu">
                <h3>Air Canada: AC317</h3>
                <h4>YYZ &rarr; LAX</h4>
                <p align="left">
                    2 Travellers <br></br>
                    DEPARTURE - 9:40 AM, September 1, 2026
                    ARRIVAL - 11:55 AM, September 1, 2026
                </p>
                
                

                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Check in</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>View Traveller Information</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Choose or Change Seats</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Manage Baggage</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Change Your Flight</button>
                </div>
                <div className="log-in-nav-button">
                    <button class="btn btn-outline-secondary" style={marginStyle}>Request a Refund</button>
                </div>

                <div className="back-button" onClick={nav_to_my_trips}>
                    <button class="btn btn-outline-secondary" style={marginStyle}>Back</button>
                </div>

            </div>
        </div>
    </div>
  );
}


function nav_to_my_trips()      { window.location.href = "/account/my-trips";       }