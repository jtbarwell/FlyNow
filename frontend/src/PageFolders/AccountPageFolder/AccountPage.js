import React, { useEffect, useState } from 'react';

export default function AccountPage() {

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedFirstName = localStorage.getItem('firstName');
        if (storedEmail) {
            setEmail(storedEmail);
        }
        if (storedFirstName) {
            setFirstName(storedFirstName);
        }
    }, []); 

    const marginStyle = {
        margin: '5px 0'
    };

  return (
    <div className="text-center">
        <h1 className="display-4">My Account</h1>

        <div className="back-panel">
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
