import React, { useEffect, useState } from 'react';

export default function ReviewBookingPage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is the review booking page where you can review all the information of your selected trip and checkout.</p>

        <div className="back-panel">
            <div className="booking-menu">
                <h2>Review Your Booking Information</h2>
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
                <br></br>

                <div className="trip-price">
                    <h4>Total Price: $1790</h4>
                </div>

                <h5>Select payment method</h5>
                <div className="payment-method-input">
                    <select>
                        <option>Credit Card</option>
                        <option>Debit Card</option>
                        <option>PayPal</option>
                    </select>
                </div>

                <div className="checkout-button" onClick={nav_to_confirm_booking}>
                    <button>Checkout</button>
                </div>

            </div>
        </div>
    </div>
  );
}

function nav_to_login() {
    window.location.href = "/login";
}

function nav_to_confirm_booking() {
    window.location.href = "/confirm-booking";
}