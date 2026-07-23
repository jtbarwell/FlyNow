import React, { useEffect, useState } from 'react';

export default function TravellerDetailsPage() {
    const [tripData, setTripData] = useState(null);
    const [travellers, setTravellers] = useState([]);

    useEffect(() => {
        const loginCheck = async () => {
            const res = await fetch('http://localhost:3001/api/check-login', {
                method: 'GET',
                credentials: "include"
            });
            const data = await res.json();
            if (!data.loggedIn) {
                window.location.href = "/login";
            }
        }
        const fetchTripData = async () => {
            const savedTripData = localStorage.getItem('tripData');
            if (savedTripData) {
                const parsed = JSON.parse(savedTripData);
                setTripData(parsed);

                const savedTravellers = localStorage.getItem('travellers');
                if (savedTravellers) {
                    setTravellers(JSON.parse(savedTravellers));
                } else {
                    const blank = [];
                    for (let i = 0; i < parsed.travellerCount; i++) {
                        blank.push({ firstName: '', lastName: '' });
                    }
                    setTravellers(blank);
                }
            }
        };

        loginCheck();
        fetchTripData();
    }, []);

    const handleTravellerChange = (index, field, value) => {
        setTravellers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    function validTravellerDetails() {
        for (let i = 0; i < travellers.length; i++) {
            if (!travellers[i].firstName.trim() || !travellers[i].lastName.trim()) {
                alert(`Please enter a first and last name for traveller ${i + 1}.`);
                return false;
            }
        }
        return true;
    }

    function navToSeating() {
        if (!validTravellerDetails()) { return; }
        localStorage.setItem('travellers', JSON.stringify(travellers));
        window.location.href = "/seating-baggage-booking";
    }

    function TravellerDetailsMenu() {
        if (!tripData) {
            return <p>Loading trip data...</p>;
        }
        return (
            <div className="booking-menu">
                <h2>Traveller Details</h2>
                <h5>{tripData?.travellerCount} Traveller{tripData?.travellerCount !== 1 ? 's' : ''}</h5>

                {travellers.map((traveller, index) => (
                    <div key={index} className="object-panel" style={{ textAlign: 'left', marginBottom: '14px', padding: '12px' }}>
                        <h5>Traveller {index + 1}</h5>
                        <div>
                            <p>First Name</p>
                            <input
                                className="input-text"
                                type="text"
                                value={traveller.firstName}
                                onChange={(e) => handleTravellerChange(index, 'firstName', e.target.value)}
                            />
                        </div>
                        <div>
                            <p>Last Name</p>
                            <input
                                className="input-text"
                                type="text"
                                value={traveller.lastName}
                                onChange={(e) => handleTravellerChange(index, 'lastName', e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <div className="continue-booking-button" onClick={navToSeating}>
                    <button>Continue</button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the traveller details page where you can enter the details for each traveller on your trip!</p>

            <div className="back-panel">
                <TravellerDetailsMenu></TravellerDetailsMenu>
            </div>
        </div>
    );
}
