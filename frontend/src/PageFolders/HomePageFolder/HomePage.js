import React, { useEffect, useState } from 'react';

export default function HomePage() {
    const marginStyle = { margin: '15px 0' };

    const [showSection, setShowSection] = useState(false);
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        setShowSection(isLoggedIn === 'false');
    }, []);

    const getGreeting = () => {
        const firstName = localStorage.getItem('firstName');
        if (!firstName) return 'Welcome!'; // Default greeting if firstName is not available
        const hours = new Date().getHours(); // Returns 0-23
        if (hours < 12) return 'Good morning ' + firstName;
        if (hours < 18) return 'Good afternoon ' + firstName;
        return 'Good evening ' + firstName;
    };

    return (
        <div className="text-center">
            <h1 className="display-4">{getGreeting()}</h1>

            <div className="back-panel">

                <div className="action-button" onClick={nav_to_search}>
                    <button style={marginStyle}>Search Flights</button>
                </div>
                
                {/* make conditional - only show up if not logged in */}
                {showSection && (
                    <><div className="action-button" onClick={nav_to_login}>
                        <button style={marginStyle}>Log In</button>
                    </div><div className="action-button" onClick={nav_to_signup}>
                            <button style={marginStyle}>Sign Up</button>
                        </div></>
                )}
                {/* ------------------------------------------------ */}
            </div>
        </div>
    );
}

function nav_to_login() {   window.location.href = "/login";    }
function nav_to_signup() {  window.location.href = "/signup";   }
function nav_to_search() {  window.location.href = "/search";   }
