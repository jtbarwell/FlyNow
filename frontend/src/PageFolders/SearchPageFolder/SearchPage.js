import React, { useEffect, useState } from 'react';

export default function SearchPage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [trip_type, setTripType] = useState('one-way');
    const [departure_date, setDepartureDate] = useState('');
    const [return_date, setReturnDate] = useState('');
    const [traveller_count, setTravellerCount] = useState(1);
    const [searchResults, setSearchResults] = useState([]);

    

    async function processSearch(overrides = {}) {
        const payload = {
            origin: overrides.origin ?? origin,
            destination: overrides.destination ?? destination,
            trip_type: overrides.trip_type ?? trip_type,
            departure_date: overrides.departure_date ?? departure_date,
            return_date: overrides.return_date ?? return_date,
            traveller_count: overrides.traveller_count ?? traveller_count
        };
        // Call the API to get the search results based on the search parameters
        try {
            const res = await fetch("http://localhost:3001/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            })
            const data = await res.json();
            setSearchResults(data);
            console.log("Search results:", data);
        } catch (error) {
            console.error('Error during search:', error);
        }
    }

    function ResultsPanel() {
        if (!searchResults || searchResults.length === 0) return null;
        var resultsHTML = [];
        if (trip_type === "one-way") {
            for (let i = 0; i < searchResults.length; i++) {
                const dep_time = new Date(searchResults[i].departureTime);
                const arr_time = new Date(searchResults[i].arrivalTime);
                const format_dep_time = dep_time.toLocaleString('en-US', {
                    month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit', hour12: true
                });
                const format_arr_time = arr_time.toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true
                });

                resultsHTML.push(
                    <div key={i} className="one-way-flight-result object-panel" onClick={() => selectTrip(i)}>
                        <div className="flight-info">
                            <p>Flight: {searchResults[i].name}</p>
                            <h5>{format_dep_time} - {format_arr_time}</h5>
                            <p>Direct</p>
                        </div>
                        <div className="trip-price">
                            <p>${searchResults[i].price.economy.toFixed(2)}</p>
                        </div>
                        <br></br>
                    </div>
                );
                resultsHTML.push(<br></br>);
            }
        }
        return resultsHTML;
    }

    const selectTrip = (index) => {
        const flight = searchResults[index];
        const tripData = {
            airline: flight.airline,
            origin: origin,
            destination: destination,
            tripType: trip_type,
            travellerCount: traveller_count,
            flights: [flight]
        };
        localStorage.setItem('tripData', JSON.stringify(tripData));
        window.location.href = "/flight-booking";
    }

    const handleOriginChange = (e) => {setOrigin(e.target.value);}
    const handleDestinationChange = (e) => {setDestination(e.target.value);}
    const handleTripTypeChange = (e) => {setTripType(e.target.value);}
    const handleDepartureDateChange = (e) => {setDepartureDate(e.target.value);}
    const handleReturnDateChange = (e) => {setReturnDate(e.target.value);}
    const handleTravellerCountChange = (e) => {setTravellerCount(e.target.value);}

    return (
        <div className="text-center">
            <h1 className="display-4">Flight Search</h1>
            <p>This is the search page where you can see all the flights that match your searches!</p>

            <div className="back-panel">
                <div className ="search-menu">
                    <div className="origin-airport-input">
                        <p>From</p>
                        <input className="input-text" type="text" placeholder="Here" value={origin} onChange={handleOriginChange} />
                    </div>
                    <div className="destination-airport-input">
                        <p>To</p>
                        <input className="input-text" type="text" placeholder="There" value={destination} onChange={handleDestinationChange} />
                    </div>

                    <div className="trip-type-input">
                        <p>Trip Type</p>
                        <select className="input-select" value={trip_type} onChange={handleTripTypeChange}>
                            <option value="one-way">One Way</option>
                            <option value="round-trip">Round Trip</option>
                        </select>
                    </div>

                    <div className="departure-date-input">
                        <p>Departure Date</p>
                        <input className="input-date" type="date" value={departure_date} onChange={handleDepartureDateChange} />
                    </div>
                    <div className="return-date-input">
                        <p>Return Date</p>
                        <input className="input-date" type="date" value={return_date} onChange={handleReturnDateChange} />
                    </div>
                    <div className="traveller-count-input">
                        <p>Traveller Count</p>
                        <input className="input-number" type="number" min="1" defaultValue="1" value={traveller_count} onChange={handleTravellerCountChange} />
                    </div>
                    <div className="search-flights-button" onClick={async () => await processSearch()}>
                        <button>Search Flights</button>
                    </div>
                </div>
                <hr></hr>
                <div className="search-results">
                    <ResultsPanel />
                    <hr></hr>
                </div>
            </div>
        </div>
    );
}