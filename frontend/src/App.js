import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import React, { useState, useMemo, useEffect } from 'react';
import './globalCSS/Table.css';
import './globalCSS/App.css';
import Header from './Header';

//  Home
import HomePage from './HomePageFolder/HomePage';


// Main App Component -------------------------------------------------------------------------------------
function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* <Route path="/my-roster" element={<MyRosterPage />} /> */}
            </Routes>
        </Router>
        
    );
}
// ========================================================================================================

export default App;
 