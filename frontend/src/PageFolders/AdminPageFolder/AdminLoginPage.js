import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleLogin = async () => {
        clearMessages();

        if (email === '' || password === '') {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!data.valid) {
                setError(data.message || 'Invalid admin credentials. Please try again.');
            } else {
                const adminName = data.admin?.fullName || data.admin?.email || 'Admin';
                localStorage.setItem('adminFullName', adminName);
                navigate('/admin');
            }
        } catch (err) {
            console.error('Error during admin login:', err);
            setError('Unable to sign in right now.');
        }
    };

    const handleCreate = async () => {
        clearMessages();

        if (email === '' || password === '' || fullName === '' || passwordRepeat === '' || pin === '') {
            setError('Please fill in every field to create an account.');
            return;
        }

        if (password !== passwordRepeat) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, fullName, password, passwordRepeat, pin })
            });

            const data = await res.json();

            if (!data.valid) {
                setError(data.message || 'Unable to create admin account.');
            } else {
                setSuccess('Admin account created successfully. Please sign in.');
                setMode('login');
                setEmail('');
                setPassword('');
                setFullName('');
                setPasswordRepeat('');
                setPin('');
            }
        } catch (err) {
            console.error('Error during admin account creation:', err);
            setError('Unable to create account right now.');
        }
    };

    return (
        <div className="text-center">
            <h1 className="display-4">Admin Login</h1>

            <div className="back-panel">

                {error && (
                    <div style={{ color: '#b42318', marginBottom: '1rem', textAlign: 'left' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ color: '#166534', marginBottom: '1rem', textAlign: 'left' }}>
                        {success}
                    </div>
                )}

                <label className="input-box">
                    <p>Email Address</p>
                    <input
                        className="input-text"
                        type="email"
                        placeholder="employee@flynow.ca"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label className="input-box">
                    <p>Password</p>
                    <input
                        className="input-text"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                {mode === 'create' && (
                    <>
                        <label className="input-box">
                            <p>Full Name</p>
                            <input
                                className="input-text"
                                type="text"
                                placeholder="Raed Karim"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </label>

                        <label className="input-box">
                            <p>Repeat Password</p>
                            <input
                                className="input-text"
                                type="password"
                                placeholder="Repeat password"
                                value={passwordRepeat}
                                onChange={(e) => setPasswordRepeat(e.target.value)}
                            />
                        </label>

                        <label className="input-box">
                            <p>Admin PIN</p>
                            <input
                                className="input-text"
                                type="text"
                                placeholder="Enter valid PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </label>
                    </>
                )}
               <div className="button-row" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div
                      className="action-button"
                      style={{ flex: 1 }}
                      onClick={
                          mode === 'create'
                              ? handleCreate
                              : () => {
                                  setMode('create');
                                  clearMessages();
                              }
                      }
                  >
                      <button type="button" style={{ width: '100%' }}>
                          {mode === 'create' ? 'Create Account' : 'Sign Up'}
                      </button>
                  </div>

                  <div
                      className="action-button"
                      style={{ flex: 1 }}
                      onClick={
                          mode === 'login'
                              ? handleLogin
                              : () => {
                                  setMode('login');
                                  clearMessages();
                              }
                      }
                  >
                      <button type="button" style={{ width: '100%' }}>
                          {mode === 'login' ? 'Login' : 'Switch to Sign In'}
                      </button>
                  </div>
              </div>
            </div>
        </div>
    );
}