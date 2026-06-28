import React, { useEffect, useState } from 'react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

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
        console.log("Signup button clicked");
        if (!email || !password || !password2) {alert("Please enter an email and password to create your account."); return;} // empty field checks
        if (!isValidEmail(email)) {alert("Email must a valid email address. Please try again."); return;} // email validation
        if (!isValidPassword(password)) {alert("Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a symbol."); return;}
        if (password != password2) {alert("Passwords do not match. Please try again."); return;} // password 2 confirmation

        try {
            const res = await fetch('http://localhost:3001/api/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            
            if (!data.valid) {alert("An account with that information already exists. Please try again.");}
            else {window.location.href = "/login";} // Redirect to login after account creation

        } catch (error) {console.error('Error during account creation:', error);}
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the signup page where you can create an account!</p>

            <div className="back-panel">
                <div className="email-input">
                    <p>Username/Email Address</p>
                    <input type="text" placeholder="Enter your username or email" onChange={handleEmailChange}/>
                </div>
                <div className="password-input">
                    <p>Password</p>
                    <input type="password" placeholder="Enter your password" onChange={handlePasswordChange}/>
                </div>
                <div className="repeat-password-input">
                    <p>Repeat Password</p>
                    <input type="password" placeholder="Enter your password again" onChange={handlePassword2Change}/>
                </div>

                <div className="create-account-button" onClick={signup}>
                    <button>Create My Account</button>
                </div>
            </div>
            
        </div>
    );
}

