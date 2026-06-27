import React, { useEffect, useState } from 'react';

export default function ConfirmBookingPage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is the booking page where you can see all the flight information of your selected trips!</p>

        <h1>Flight Booked Successfully!</h1>

        <div className="back-panel">
            <div className="booking-menu">
                <h3>Air Canada</h3>
                <h4>YYZ &rarr; LAX</h4>
                <h5>Round Trip - 2 Travellers</h5>
                
                <div className="object-panel">
                    <div className="voyage-info">
                        <div className="flight-info">
                            <h5>9:40 AM - 11:55 AM  April 1, 2025</h5>
                            <h6>YYZ - LAX</h6>
                            <p>Flight: AC317</p>
                        </div>
                    </div>
                </div>
                <br></br>
                <div className="object-panel">
                    <div className="voyage-info">
                        <div className="flight-info">
                            <h5>10:10 PM - 2:25 AM  April 2, 2025</h5>
                            <h6>LAX - ORD</h6>
                            <p>Flight: AC270</p>
                        </div>
                        <hr></hr>
                        <div className="flight-info">
                            <h5>8:20 AM - 12:00 PM  April 3, 2025</h5>
                            <p>ORD - YYZ</p>
                            <p>Flight: AC318</p>
                        </div>
                    </div>
                </div>

                <div className="trip-price">
                    <h4>$1790</h4>
                </div>

                <div className="return-to-home-button" onClick={nav_to_home}>
                    <button>Return to Search</button>
                </div>

            </div>
        </div>
    </div>
  );
}

function nav_to_home() {
    window.location.href = "/";
}
