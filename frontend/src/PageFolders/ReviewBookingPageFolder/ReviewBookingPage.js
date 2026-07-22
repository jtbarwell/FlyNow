import React, { useEffect, useState } from 'react';

const POINTS_REDEMPTION_INCREMENT = 1000;
const POINTS_REDEMPTION_VALUE = 25;

export default function ReviewBookingPage() {
    const [tripData, setTripData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [additionalCheckedBags, setAdditionalCheckedBags] = useState(0);
    const [userPoints, setUserPoints] = useState(0);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);

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
        const fetchData = async () => {
            const savedTripData = localStorage.getItem('tripData');
            if (savedTripData) {setTripData(JSON.parse(savedTripData));}
            const savedSelectedSeats = localStorage.getItem('selectedSeats');
            if (savedSelectedSeats) {setSelectedSeats(JSON.parse(savedSelectedSeats));}
            const savedAdditionalCheckedBags = localStorage.getItem('additionalCheckedBags');
            if (savedAdditionalCheckedBags) {setAdditionalCheckedBags(parseInt(savedAdditionalCheckedBags));}
        };

        const fetchPoints = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/user/points', {
                    method: 'GET',
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserPoints(data.points || 0);
                }
            } catch (error) {
                console.error('Error fetching points balance:', error);
            }
        };

        loginCheck();
        fetchData();
        fetchPoints();
    }, []);

    function renderFlightInfo(flight, flightIndex) {
        const dep_time = new Date(flight.departureTime);
        const arr_time = new Date(flight.arrivalTime);
        const format_dep_time = dep_time.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
        const format_arr_time = arr_time.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
        return (
            <div className="flight-info">
                <h5>{format_dep_time} - {format_arr_time}</h5>
                <h6>{flight.origin} - {flight.destination}</h6>
                <div className="flight-info-bottom-bar">
                    <p>Flight: {flight.name}</p>
                    <p>{selectedSeats[flightIndex] ? selectedSeats[flightIndex].join(', ') : 'None'}</p>
                </div>
            </div>
        );
    }

    function calculateTotalPrice(flights) {
        let totalPrice = 0;
        for (const flight of flights) {
            for (const seat of selectedSeats[tripData.flights.indexOf(flight)] || []) {
                const seatInfo = flight.seats.find(s => s.name === seat);
                if (seatInfo) {
                    const seatCost = flight.price[seatInfo.class] || 0;
                    totalPrice += seatCost;
                }
            }
        }
        return totalPrice + (additionalCheckedBags * 50); // Assuming $50 per additional checked bag
    }

    useEffect(() => {
        if (!tripData) return;
        const totalPrice = calculateTotalPrice(tripData.flights);
        const maxRedeemable = getMaxRedeemablePoints(totalPrice);
        if (pointsToRedeem > maxRedeemable) {
            setPointsToRedeem(maxRedeemable);
        }
    }, [tripData, additionalCheckedBags, userPoints]);

    function getMaxRedeemablePoints(totalPrice) {
    // Only whole 1000-point increments, capped by what the user owns and by the order total
    const maxByBalance = Math.floor(userPoints / POINTS_REDEMPTION_INCREMENT) * POINTS_REDEMPTION_INCREMENT;
    const maxByPrice = Math.floor(totalPrice / POINTS_REDEMPTION_VALUE) * POINTS_REDEMPTION_INCREMENT;
    return Math.max(0, Math.min(maxByBalance, maxByPrice));
    }

    function getDiscount() {
        return (pointsToRedeem / POINTS_REDEMPTION_INCREMENT) * POINTS_REDEMPTION_VALUE;
    }

    function getFinalPrice(totalPrice) {
        return Math.max(0, totalPrice - getDiscount());
    }

    function getPointsToBeEarned(finalPrice) {
        return Math.floor(finalPrice);
    }

    function handlePointsRedeemChange(e) {
        setPointsToRedeem(parseInt(e.target.value));
    }

    function getTotalPriceOfLevel(flight, level) {
        // find total price of seats selected for this flight and level
        let totalPrice = 0;
        const levelSeats = flight.seats.filter(s => s.class === level);
        for (const seat of selectedSeats[tripData.flights.indexOf(flight)] || []) {
            const seatInfo = levelSeats.find(s => s.name === seat);
            if (seatInfo) {
                const seatCost = flight.price[seatInfo.class] || 0;
                totalPrice += seatCost;
            }
        }
        return totalPrice;
    }

    function PriceBreakdown() {
        if (!tripData) return null;
        return (
            <div className="price-breakdown">
                <h5>Flights</h5>
                {tripData.flights.map((flight, index) => (
                    <div key={index} className="flight-price-breakdown">
                        <h5>Flight {index + 1}: {flight.name}</h5>
                        <p>Economy (${flight.price.economy.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'economy').toFixed(2)}</p>
                        <p>Business (${flight.price.business.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'business').toFixed(2)}</p>
                        <p>First Class (${flight.price.firstClass.toFixed(2)}): ${getTotalPriceOfLevel(flight, 'firstClass').toFixed(2)}</p>
                        <p>Additional Checked Bags: {additionalCheckedBags} x $50 = ${(additionalCheckedBags * 50).toFixed(2)}</p>
                    </div>
                ))}
                
            </div>
        );
    }

    async function checkout() {
        try {
            // Send the booking data to the backend for processing
            const bookedFlights = [];
            for (let i = 0; i < tripData.flights.length; i++) {
                bookedFlights.push(
                    {
                        flightID: tripData.flights[i].flightID,
                        seats: selectedSeats[i]
                    });
            };
            const payload = {
              tripType: tripData.tripType,
              travellerCount: tripData.travellerCount,
              bookedFlights,
              additionalCheckedBags,
              pointsRedeemed: pointsToRedeem
            };
            
            const res = await fetch("http://localhost:3001/api/bookingConfirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (!res.ok || !data || data.error) {
                console.error('Booking failed:', data);
                alert(data?.error ||'Booking failed. Please try again.');
                return;
            }
            // Debugging
            console.log("Booking confirmed:", data);
            // Save the loyalty points summary so the confirmation page can display it
            localStorage.setItem('lastBookingSummary', JSON.stringify({
                totalPrice: data.booking.totalPrice,
                discount: data.booking.discount,
                finalPrice: data.booking.finalPrice,
                pointsRedeemed: data.booking.pointsRedeemed,
                pointsEarned: data.booking.pointsEarned,
                pointsBalance: data.pointsBalance
            }));
            // Redirect to confirmation page
            window.location.href = "/confirm-booking";
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    }

    return (
        <div className="text-center">
            <h1 className="display-4">Welcome</h1>
            <p>This is the review booking page where you can review all the information of your selected trip and checkout.</p>

            <div className="back-panel">
                <div className="booking-menu">
                    <h2>Review Your Booking Information</h2>
                    <hr></hr>
                    <h3>{tripData?.airlines.join(' + ')}</h3>
                    <h4>{tripData?.origin} &rarr; {tripData?.destination}</h4>
                    <h5>{tripData?.tripType === 'one-way' ? 'One-Way' : 'Round-Trip'} - {tripData?.travellerCount} Traveller{tripData?.travellerCount !== 1 ? 's' : ''}</h5>
                    
                    {tripData?.tripType === 'round-trip' && tripData?.flights.length > 1 ? (
                        <div className="trip-list">
                            <div className="object-panel">
                                {tripData && renderFlightInfo(tripData?.flights[0], 0)}
                            </div>
                            <br></br>
                            <div className="object-panel">
                                {tripData && renderFlightInfo(tripData?.flights[1], 1)}
                            </div>
                        </div>
                    ) : (
                        <div className="trip-list">
                            <div className="object-panel">
                                {tripData && renderFlightInfo(tripData?.flights[0] , 0)}
                            </div>
                        </div>
                    )}

                    <br></br>

                    <PriceBreakdown></PriceBreakdown>

                    <div className="trip-price">
                        <h4>Subtotal: ${tripData ? calculateTotalPrice(tripData.flights).toFixed(2) : '0.00'}</h4>
                    </div>

                    <hr></hr>

                    <h5>Redeem Loyalty Points</h5>
                    <p>You have {userPoints.toLocaleString()} points. Redeem {POINTS_REDEMPTION_INCREMENT.toLocaleString()} points for a ${POINTS_REDEMPTION_VALUE} discount.</p>
                    {tripData && (() => {
                        const totalPrice = calculateTotalPrice(tripData.flights);
                        const maxRedeemable = getMaxRedeemablePoints(totalPrice);
                        const options = [];
                        for (let p = 0; p <= maxRedeemable; p += POINTS_REDEMPTION_INCREMENT) {
                            options.push(p);
                        }
                        return (
                            <div className="payment-method-input">
                                <select value={pointsToRedeem} onChange={handlePointsRedeemChange} disabled={maxRedeemable === 0}>
                                    {options.map(p => (
                                        <option key={p} value={p}>
                                            {p === 0 ? 'Do not redeem points' : `${p.toLocaleString()} points (-$${((p / POINTS_REDEMPTION_INCREMENT) * POINTS_REDEMPTION_VALUE).toFixed(2)})`}
                                        </option>
                                    ))}
                                </select>
                                {maxRedeemable === 0 && <p>You don't have enough points to redeem yet.</p>}
                            </div>
                        );
                    })()}

                    <br></br>

                    {tripData && (() => {
                        const totalPrice = calculateTotalPrice(tripData.flights);
                        const discount = getDiscount();
                        const finalPrice = getFinalPrice(totalPrice);
                        const pointsEarned = getPointsToBeEarned(finalPrice);
                        return (
                            <div className="trip-price">
                                {discount > 0 && <h5>Points Discount: -${discount.toFixed(2)}</h5>}
                                <h4>Total Price: ${finalPrice.toFixed(2)}</h4>
                                <p>You will earn {pointsEarned.toLocaleString()} loyalty points from this booking.</p>
                            </div>
                        );
                    })()}

                    <hr></hr>

                    <h5>Select payment method</h5>
                    <div className="payment-method-input">
                        <select>
                            <option>Credit Card</option>
                            <option>Debit Card</option>
                            <option>PayPal</option>
                        </select>
                    </div>

                    <br></br>

                    <div className="checkout-button" onClick={checkout}>
                        <button>Checkout</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

