import React, { useEffect, useState } from 'react';

export default function SignupPage() {
    const [firstName, setFirstname] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const handleFirstnameChange = (e) => {setFirstname(e.target.value);}
    const handleSurnameChange = (e) => {setSurname(e.target.value);}
    const handleEmailChange = (e) => {setEmail(e.target.value);}
    const handlePasswordChange = (e) => {setPassword(e.target.value);}
    const handlePassword2Change = (e) => {setPassword2(e.target.value);}

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    }

    async function signup() {
        if (!firstName) {alert("Please enter your First Name"); return;}
        if (!surname) {alert("Please enter your Surname"); return;}

        if (!email || !password || !password2) {alert("Please enter an email and password to create your account."); return;} // empty field checks
        if (!isValidEmail(email)) {alert("Email must a valid email address. Please try again."); return;} // email validation
        if (!isValidPassword(password)) {alert("Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a symbol."); return;}
        if (password != password2) {alert("Passwords do not match. Please try again."); return;} // password 2 confirmation

        try {
            const res = await fetch('http://localhost:3001/api/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: "include",
                body: JSON.stringify({ firstName, surname, email, password })
            });

            const data = await res.json();
            
            if (!data.valid) {
                alert("An account with that information already exists. Please try again.");
            } else {
                window.location.href = "/login"; // Redirect to login after account creation
            }
        } catch (error) {
            console.error('Error during account creation:', error);
        }
    }

    return (
        
        <div className="text-center">
            <h1 className="display-4">Create Account</h1>

            <div className="back-panel">
                <label className="input-box">
                    <p>First Name*</p>
                    <input className="input-text" type="text" placeholder="" onChange={handleFirstnameChange} />
                </label>
                <label className="input-box">
                    <p>Surname*</p>
                    <input className="input-text" type="text" placeholder="" onChange={handleSurnameChange} />
                </label>
                <label className="input-box">
                    <p>Email Address*</p>
                    <input className="input-text" type="text" placeholder="" onChange={handleEmailChange} />
                </label>
                <label className="input-box">
                    <p>Enter Password*</p>
                    <input className="input-text" type="password" placeholder="" onChange={handlePasswordChange} />
                </label>
                <label className="input-box">
                    <p>Confirm Password*</p>
                    <input className="input-text" type="password" placeholder="" onChange={handlePassword2Change} />
                </label>

                <div className="action-button" onClick={signup}>
                    <button>Create My Account</button>
                </div>
            </div>            
        </div>
        
  );
}