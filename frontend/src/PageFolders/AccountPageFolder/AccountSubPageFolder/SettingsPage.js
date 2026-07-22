import React, { useState } from 'react';
import { useSendEmail } from '../../../hooks/useSendEmail';

export default function SettingsPage() {
    const marginStyle = { margin: '5px 0' };
    let name = localStorage.getItem('firstName');

    const { sendEmail: sendTestEmail, emailStatus: testEmailStatus } = useSendEmail();

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

    return (
        <div className="text-center">
            <h1 className="display-4">Settings</h1>

            <div className="back-panel">
                <div className="action-button" onClick={() => sendTestEmail('testEmail', { name })}>
                    <button style={marginStyle}>Send Test Email</button>
                </div>
                {testEmailStatus && <p>{testEmailStatus}</p>}

                <div className="action-button" onClick={nav_to_reset}>
                    <button style={marginStyle}>Reset Password</button>
                </div>

                <div className="action-button" onClick={signout}>
                    <button style={marginStyle}>Sign Out</button>
                </div>
            </div>
        </div>
    );
}

function nav_to_reset() { window.location.href = "/account/settings/request-reset-password"; }
