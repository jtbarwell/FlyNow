import React, { useEffect, useState } from 'react';

export default function SettingsPage() {

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
                <div className="action-button" onClick={signout}>
                    <button>Sign Out</button>
                </div>
            </div>
        </div>
    );
}

