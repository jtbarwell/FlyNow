import React, { useEffect, useState } from 'react';

export default function SettingsPage() {
    const marginStyle = { margin: '5px 0' };
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [points, setPoints] = useState(null);





    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');
        if (storedEmail) {
            setEmail(storedEmail);
        }
        if (storedFirstName) {
            setFirstName(storedFirstName);
        }
        if (storedLastName) {
            setLastName(storedLastName);
        }

        const fetchPoints = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/user/points', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setPoints(data.points || 0);
                }
            } catch (error) {
                console.error('Error fetching points balance:', error);
            }
        };
        fetchPoints();
    }, []); 
    return (
        <div className="text-center">
            <h1 className="display-4">Personal Information</h1>

            <div className="back-panel">
                <div className="price-breakdown" style={{ marginBottom: '18px' }}>
                    <h5>Loyalty Points</h5>
                    <h3>{points !== null ? points.toLocaleString() : '...'} points</h3>
                    <p>
                        Earn 1 point for every dollar you spend on flight bookings (rounded down to the nearest dollar).
                        At checkout, redeem 1,000 points for a $25 discount, in increments of 1,000 up to your available
                        balance. If a booking is cancelled, any points it earned are removed and any points redeemed on
                        it are refunded back to your account.
                    </p>
                </div>
                <label className="input-box">
                    <p>First Name</p>
                    <input className="input-text" type="" placeholder={firstName} disabled/>
                </label>
                <label className="input-box">
                    <p>Last Name</p>
                    <input className="input-text" type="" placeholder={lastName} disabled/>
                </label>
                <label className="input-box">
                    <p>Email Address</p>
                    <input className="input-text" type="" placeholder={email} disabled/>
                </label>
            </div>
        </div>
    );
}