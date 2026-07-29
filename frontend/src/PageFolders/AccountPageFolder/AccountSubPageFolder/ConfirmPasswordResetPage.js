import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ConfirmPasswordResetPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
	const [status, setStatus] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const handlePasswordChange = (e) => {setPassword(e.target.value);}
    const handlePassword2Change = (e) => {setPassword2(e.target.value);}

    const delay = ms => new Promise(res => setTimeout(res, ms));

    function isValidPassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('Resetting...');

        try {
            const response = await fetch('http://localhost:3001/api/confirm-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const result = await response.json();
            setStatus(result.message);
            if (result.success) {
                await delay(3000); // Pauses execution for 3 seconds
                window.location.href = "/account";
            }
        } catch (error) {
            console.error(error);
            setStatus('An error occurred.');
        }
        setTimeout(() => setStatus(''), 2000);
    }



    return (
        
        <div className="text-center">
            <h1 className="display-4">Enter your new password</h1>

            <div className="back-panel">
                <label className="input-box">
                    <p>Enter Password*</p>
                    <input className="input-text" type="password" placeholder="" onChange={handlePasswordChange} />
                </label>
                <label className="input-box">
                    <p>Confirm Password*</p>
                    <input className="input-text" type="password" placeholder="" onChange={handlePassword2Change} />
                </label>

                <div className="action-button" onClick={handleSubmit}>
                    <button>Confirm Password</button>
                </div>
				{status && <p>{status}</p>}
            </div>            
        </div>
        
  );
}