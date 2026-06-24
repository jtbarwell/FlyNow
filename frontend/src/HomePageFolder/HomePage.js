import React, { useEffect, useState } from 'react';

export default function HomePage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is the home page where (if no account) you can create one! If you already have an account, you can log in.</p>

        <div className="parent">
            <div className="child-top">
                <p>Sign Up</p>
            </div>
            <div className="child-top">
                <p>Log In</p>
            </div>
        </div>
    </div>
  );
}