import React, { useEffect, useState } from 'react';

export default function SignupPage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is the signup page where you can create an account!</p>

        <div className="back-panel">
            <div className="username-input">
                <p>Username/Email Address</p>
                <input type="text" placeholder="Enter your username or email" />
            </div>
            <div className="password-input">
                <p>Password</p>
                <input type="password" placeholder="Enter your password" />
            </div>
            <div className="repeat-password-input">
                <p>Repeat Password</p>
                <input type="password" placeholder="Enter your password again" />
            </div>

            <div className="create-account-button" onClick={signup}>
                <button>Create My Account</button>
            </div>
        </div>
        
    </div>
  );
}

function signup() {
    // Implement signup logic here
    console.log("Signup button clicked");
    window.location.href = "/login"; // Redirect to login page after signup
}