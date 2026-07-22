import React, { useEffect, useState } from 'react';

export default function AccountPage() {

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [points, setPoints] = useState(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedFirstName = localStorage.getItem('firstName');
        if (storedEmail) {
            setEmail(storedEmail);
        }
        if (storedFirstName) {
            setFirstName(storedFirstName);
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

    const marginStyle = {
        margin: '5px 0'
    };

  return (
    <div className="text-center">
        <h1 className="display-4">My Account</h1>

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

            {/* <h3 className="display-6">Welcome, {firstName}</h3> */}
            <div className="action-button" onClick={nav_to_personal_info}>
                <button style={marginStyle}>Personal Information</button>
            </div>
            <div className="action-button" onClick={nav_to_payment_info}>
                <button style={marginStyle}>Payment Information</button>
            </div>
            <div className="action-button" onClick={nav_to_my_trips}>
                <button style={marginStyle}>My Trips</button>
            </div>
            <div className="action-button" onClick={nav_to_settings}>
                <button style={marginStyle}>Settings</button>
            </div>
        </div>
    </div>
  );
}

function nav_to_personal_info() { window.location.href = "/account/personal-info";  }
function nav_to_payment_info()  { window.location.href = "/account/payment-info";   }
function nav_to_my_trips()      { window.location.href = "/account/my-trips";       }
function nav_to_settings()      { window.location.href = "/account/settings";       }
