import React, { useEffect, useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    async function login() {
        // Empty field error handling
        if (email === '' || password === '') {
            alert("Please enter both email and password.");
            return;
        }
        
        // Send login request to the backend
        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            
            if (!data.valid) {
                alert("Invalid email or password. Please try again.");
            } else {
                localStorage.setItem('isLoggedIn', 'true'); // Set login status in local storage
                localStorage.setItem('email', email); // Store the email in local storage
                window.location.href = "/"; // Redirect to home page after login
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Login</h1>

            <div className="back-panel">
                <label className="input-box">
                    <p>Email Address</p>
                    <input className="input-text" type="text" placeholder="" onChange={handleEmailChange} />
                </label>
                <label className="input-box">
                    <p>Password</p>
                    <input className="input-text" type="password" placeholder="" onChange={handlePasswordChange} />
                </label>
                <div className="button-row">
                    <div className="action-button" onClick={nav_to_signup}>
                        <button>Sign Up</button>
                    </div>
                    <div className="action-button" onClick={login}>
                        <button>Login</button>
                    </div>
                </div>
                <br />
                <p style={{ color: '#a491ab' }}>Are you an Admin? Log in <a href="/admin/login" style={{ color: '#a491ab' }}>here</a></p>
            </div>
        </div>
    );
}




function nav_to_signup() {
    window.location.href = "/signup";
}
