import React, { useEffect, useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    async function login() {
        // Empty field error handling
        if (username === '' || password === '') {
            alert("Please enter both username and password.");
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
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            
            if (!data.valid) {
                alert("Invalid username or password. Please try again.");
            } else {
                localStorage.setItem('isLoggedIn', 'true'); // Set login status in local storage
                localStorage.setItem('username', username); // Store the username in local storage
                window.location.href = "/"; // Redirect to home page after login
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the login page where you can login in to your account! If you don't have an account, you can create one by clicking the button below.</p>

            <div className="back-panel">
                <div className="username-input">
                    <p>Username/Email Address</p>
                    <input type="text" placeholder="Enter your username or email" onChange={handleUsernameChange} />
                </div>
                <div className="password-input">
                    <p>Password</p>
                    <input type="password" placeholder="Enter your password" onChange={handlePasswordChange} />
                </div>

                <div className="login-button" onClick={login}>
                    <button>Log In</button>
                </div>
                <div className="sign-up-button" onClick={nav_to_signup}>
                    <button>Sign Up</button>
                </div>

            </div>
            
        </div>
    );
}



function nav_to_signup() {
    window.location.href = "/signup";
}