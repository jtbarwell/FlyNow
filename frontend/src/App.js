import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import React, { useState, useMemo, useEffect } from 'react';
import './globalCSS/Table.css';
import './globalCSS/App.css';
import Header from './Header';

//  Home
import HomePage from './PageFolders/HomePageFolder/HomePage';
import LoginPage from './PageFolders/LoginPageFolder/LoginPage';
import SearchPage from './PageFolders/SearchPageFolder/SearchPage';
import SignupPage from './PageFolders/SignupPageFolder/SignupPage';
import FlightBookingPage from './PageFolders/FlightBookingPageFolder/FlightBookingPage';
import SeatingBaggagePage from './PageFolders/SeatingBaggagePageFolder/SeatingBaggagePage';
import ReviewBookingPage from './PageFolders/ReviewBookingPageFolder/ReviewBookingPage';
import ConfirmBookingPage from './PageFolders/ConfirmBookingPageFolder/ConfirmBookingPage';
import AccountPage from './PageFolders/AccountPageFolder/AccountPage';
// import PersonalInfoPage from './PageFolders/AccountPageFolder/AccountPageSubFolder/PersonalInfoPage';
// import PaymentInfoPage from './PageFolders/AccountPageFolder/AccountPageSubFolder/PaymentInfoPage';
import UserTripsPage from './PageFolders/AccountPageFolder/AccountSubPageFolder/UserTripsPage';
// import SettingsPage from './PageFolders/AccountPageFolder/AccountPageSubFolder/SettingsPage';
import UserFlightDetailsPage from './PageFolders/AccountPageFolder/AccountSubPageFolder/UserFlightDetailsPage';


// Main App Component -------------------------------------------------------------------------------------
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if the user is logged in (you can replace this with your actual login check logic)
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedInStatus);
    }, []);

    
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/flight-booking" element={<FlightBookingPage />} />
                <Route path="/seating-baggage-booking" element={<SeatingBaggagePage />} />
                <Route path="/review-booking" element={<ReviewBookingPage />} />
                <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/my-trips" element={<UserTripsPage />} />
                {/* <Route path="/account/personal-info" element={<PersonalInfoPage />} />
                <Route path="/account/payment-info" element={<PaymentInfoPage />} />
                <Route path="/account/settings" element={<SettingsPage />} /> */}
                <Route path="/account/my-trips/flight-details" element={<UserFlightDetailsPage />} />
            </Routes>
        </Router>
        
    );
}
// ========================================================================================================

export default App;
 