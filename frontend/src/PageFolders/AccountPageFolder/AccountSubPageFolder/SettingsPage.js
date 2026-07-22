import React, { useEffect, useState } from 'react';

export default function SettingsPage() {
    const [emailStatus, setEmailStatus] = useState('');
    const marginStyle = { margin: '5px 0' };
    

    async function signout() {
        localStorage.setItem('isLoggedIn', 'false'); // Set login status in local storage
        localStorage.setItem('email', ''); // Store the email in local storage

        try {
            const res = await fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                credentials: "include"
            });
            
            if (!res) {
                alert("Logout unsuccessful. Please try again.");
            } else {
                window.location.href = "/"; // Redirect to home page after log out
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    async function sendEmail(e) {
        e.preventDefault();
        setEmailStatus('Sending...');
        let name = localStorage.getItem('firstName');
        let email = localStorage.getItem('email');
        let message = "This is a test email from the FlyNow application.";

        try {
            const response = await fetch('http://localhost:3001/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();
            setEmailStatus(data.success ? 'Email sent!' : 'Failed to send email.');
        } catch (error) {
            console.error(error);
            setEmailStatus('An error occurred.');
        }
        // wait 3 seconds and then clear the status message
        setTimeout(() => {
            setEmailStatus('');
        }, 2000);
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Settings</h1>

            <div className="back-panel">
                <div className="action-button" onClick={sendEmail}>
                    <button style={marginStyle}>Send Test Email</button>
                </div>
                {emailStatus && <p>{emailStatus}</p>}

                <div className="action-button" onClick={signout}>
                    <button style={marginStyle}>Sign Out</button>
                </div>
            </div>
        </div>
    );
}

