import React, { useEffect, useState } from 'react';

export default function SearchPage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [trip_type, setTripType] = useState('one-way');
    const [departure_date, setDepartureDate] = useState('');
    const [return_date, setReturnDate] = useState('');
    const [traveller_count, setTravellerCount] = useState(1);
    const [outboundFlights, setOutboundFlights] = useState([]);
    const [returnFlights, setReturnFlights] = useState([]);
    const [outboundIndex, setOutboundIndex] = useState(null);

    async function processSearch(overrides = {}) {
        const payload = {
            origin: overrides.origin ?? origin,
            destination: overrides.destination ?? destination,
            trip_type: overrides.trip_type ?? trip_type,
            departure_date: overrides.departure_date ?? departure_date,
            return_date: overrides.return_date ?? return_date,
            traveller_count: overrides.traveller_count ?? traveller_count
        };

        payload.origin = payload.origin.trim().toUpperCase();
        payload.destination = payload.destination.trim().toUpperCase();

        if (!payload.origin || !payload.destination) {
            alert('Please enter both an origin and destination.');
            return;
        }
        if (payload.origin === payload.destination) {
            alert('Your origin and destination cannot be the same.');
            return;
        }
        if (!payload.departure_date) {
            alert('Please select a departure date.');
            return;
        }
        if (payload.trip_type === 'round-trip') {
            if (!payload.return_date) {
                alert('Please select a return date.');
                return;
            }
            if (payload.return_date < payload.departure_date) {
                alert('Your return date cannot be before your departure date.');
                return;
            }
        }

        // Call the API to get the search results based on the search parameters
        try {
            const res = await fetch("http://localhost:3001/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            })
            const data = await res.json();
            setOutboundFlights(data.outboundFlights || []);
            setReturnFlights(data.returnFlights || []);
            setOutboundIndex(null);
            console.log("Search results:", data);
        } catch (error) {
            console.error('Error during search:', error);
        }
    }

    function OneWayPanel({ flights, onSelect, selectedIndex }) {
        if (!flights || flights.length === 0) return null;
        var resultsHTML = [];
        for (let i = 0; i < flights.length; i++) {
            const dep_time = new Date(flights[i].departureTime);
            const arr_time = new Date(flights[i].arrivalTime);
            const format_dep_time = dep_time.toLocaleString('en-US', {
                month: 'short', day: 'numeric', 
                hour: 'numeric', minute: '2-digit', hour12: true
            });
            const format_arr_time = arr_time.toLocaleString('en-US', {
                month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
            resultsHTML.push(
                <div key={i} className="one-way-flight-result object-panel"
                     style={selectedIndex === i ? { border: '2px solid #4a90d9' } : {}}
                     onClick={() => onSelect(i)}>
                    <div className="flight-info">
                        <p>Flight: {flights[i].name}</p>
                        <h5>{format_dep_time} - {format_arr_time}</h5>
                        <p>Direct</p>
                    </div>
                    <div className="trip-price">
                        <p>${flights[i].price.economy.toFixed(2)}</p>
                    </div>
                    <br></br>
                </div>
            );
            resultsHTML.push(<br></br>);
        }
        return resultsHTML;
    }

   function ResultsPanel() {
        if (!outboundFlights || outboundFlights.length === 0) return null;

        if (trip_type === "one-way") {
            return <OneWayPanel flights={outboundFlights} onSelect={selectTrip} />;
        }

        return (
            <div>
                <h4>Step 1: Choose your departing flight</h4>
                <OneWayPanel
                    flights={outboundFlights}
                    onSelect={setOutboundIndex}
                    selectedIndex={outboundIndex}
                />

                {outboundIndex !== null && (
                    <div>
                        <hr></hr>
                        <h4>Step 2: Choose your return flight</h4>
                        {returnFlights.length === 0
                            ? <p>No return flights found for that date.</p>
                            : <OneWayPanel flights={returnFlights} onSelect={selectReturnTrip} />}
                    </div>
                )}
            </div>
        );
    }

    const airlineLogic =  (flights) => {
        const airlines = [];
        for (const flight of flights) {
            if (!airlines.includes(flight.airline)) {
                airlines.push(flight.airline);
            }
        }
        return airlines;
    };

    const buildTrip = (flights) => {
        const tripData = {
            airlines: airlineLogic(flights),
            origin: origin,
            destination: destination,
            tripType: trip_type,
            travellerCount: Number(traveller_count),
            flights: flights
        };
        localStorage.setItem('tripData', JSON.stringify(tripData));
        window.location.href = "/flight-booking";
    }

    const selectTrip = (index) => {
        buildTrip([outboundFlights[index]]);
    };

    const selectReturnTrip = (index) => {
        buildTrip([outboundFlights[outboundIndex], returnFlights[index]]);
    };

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
                        <input className="input-number" type="number" min="1" value={traveller_count} onChange={handleTravellerCountChange} />
                    </div>
                    <div className="search-flights-button" onClick={async () => await processSearch()}>
                        <button>Search Flights</button>
                    </div>
                </div>
                <hr></hr>
                <div className="search-results">
                    <ResultsPanel />
                </div>
            </div>
        </div>
    );
}
