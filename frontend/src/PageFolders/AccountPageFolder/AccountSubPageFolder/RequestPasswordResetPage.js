import React, { useEffect, useState } from 'react';

export default function RequestPasswordResetPage() {
    const [email, setEmail] = useState('');

    const handleEmailChange = (e) => {setEmail(e.target.value);}

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function request() {

        try {
            const res = await fetch('http://localhost:3001/api/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch (error) {
            console.error('Error during request:', error);
        }
    }



    return (
        
        <div className="text-center">
            <h1 className="display-4">Request Password Reset</h1>

            <div className="back-panel">
                <label className="input-box">
                    <p>Email Address*</p>
                    <input className="input-text" type="email" placeholder="" onChange={handleEmailChange} />
                </label>

                <div className="action-button" onClick={request}>
                    <button>Request Reset</button>
                </div>
            </div>            
        </div>
        
  );
}