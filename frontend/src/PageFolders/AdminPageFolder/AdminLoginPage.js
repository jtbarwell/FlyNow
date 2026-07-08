import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.valid) {
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      console.error('Admin login failed', err);
      setError('Unable to sign in right now.');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email || !password || !passwordRepeat || !pin) {
      setError('Please fill in every field to create an account.');
      return;
    }

    if (password !== passwordRepeat) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, passwordRepeat, pin })
      });

      const data = await response.json();
      if (data.valid) {
        setSuccess('Admin account created successfully. Please sign in.');
        setMode('login');
        setPassword('');
        setPasswordRepeat('');
        setPin('');
      } else {
        setError(data.message || 'Unable to create admin account.');
      }
    } catch (err) {
      console.error('Admin create failed', err);
      setError('Unable to create account right now.');
    }
  };

  return (
    <div className="text-center" style={{ minHeight: '100vh', padding: '2rem', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="back-panel" style={{ width: '100%', maxWidth: 480 }}>
        <h1 className="display-4" style={{ marginBottom: 8 }}>FlyNow Admin</h1>
        <p style={{ marginBottom: '1.2rem', color: '#475467' }}>Staff access to flight management and passenger lists. Create an admin account or sign in with your credentials.</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); clearMessages(); }}
            className={mode === 'login' ? 'btn btn-primary' : 'btn btn-outline-secondary'}
            style={{ flex: 1 }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('create'); clearMessages(); }}
            className={mode === 'create' ? 'btn btn-primary' : 'btn btn-outline-secondary'}
            style={{ flex: 1 }}
          >
            Create Account
          </button>
        </div>

        {error && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 8, background: '#ffeff0', color: '#b42318' }}>{error}</div>}
        {success && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 8, background: '#ecfdf3', color: '#166534' }}>{success}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleCreate}>
          <div style={{ marginBottom: '0.75rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Username/Email Address</label>
            <input
              className="input-text"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="employee@flynow.ca"
            />
          </div>

          <div style={{ marginBottom: '0.75rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
            <input
              className="input-text"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </div>

          {mode === 'create' && (
            <>
              <div style={{ marginBottom: '0.75rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Repeat Password</label>
                <input
                  className="input-text"
                  type="password"
                  value={passwordRepeat}
                  onChange={(event) => setPasswordRepeat(event.target.value)}
                  placeholder="Repeat password"
                />
              </div>
              <div style={{ marginBottom: '0.75rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Admin PIN</label>
                <input
                  className="input-text"
                  type="text"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="123456"
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{mode === 'login' ? 'Sign In' : 'Create My Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
