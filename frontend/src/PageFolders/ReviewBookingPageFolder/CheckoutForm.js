import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        sessionStorage.setItem("alreadyConfirmed", 'false')

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/confirm-booking`, // Redirect target after authorization
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsProcessing(false);

    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <br></br>
            <div className="action-button">
                <button disabled={isProcessing || !stripe || !elements}>
                    <span>{isProcessing ? "Processing..." : "Pay now"}</span>
                </button>
            </div>
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}