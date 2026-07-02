import React, { useEffect, useState } from 'react';

export default function AccountPage() {

    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []); 

    const marginStyle = {
        margin: '5px 0'
    };

  return (
    <div className="text-center">
        <h1 className="display-4">Good Morning, {username}</h1>
        <p>This is the account page where you can manage your account settings and view your booking history.</p>

        <div className="back-panel">




            <div className="log-in-nav-button" onClick={nav_to_personal_info}>
                <button class="btn btn-outline-secondary" style={marginStyle}>Personal Information</button>
            </div>
            <div className="log-in-nav-button" onClick={nav_to_payment_info}>
                <button class="btn btn-outline-secondary" style={marginStyle}>Payment Information</button>
            </div>
            <div className="log-in-nav-button" onClick={nav_to_my_trips}>
                <button class="btn btn-outline-secondary" style={marginStyle}>My Trips</button>
            </div>
            <div className="log-in-nav-button" onClick={nav_to_settings}>
                <button class="btn btn-outline-secondary" style={marginStyle}>Settings</button>
            </div>
        </div>
    </div>
  );
}

function nav_to_personal_info() { window.location.href = "/account/personal-info";  }
function nav_to_payment_info()  { window.location.href = "/account/payment-info";   }
function nav_to_my_trips()      { window.location.href = "/account/my-trips";       }
function nav_to_settings()      { window.location.href = "/account/settings";       }
