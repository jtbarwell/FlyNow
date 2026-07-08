import React, { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/admin/list', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.valid) {
        setAdmins(data.admins.map(admin => ({ ...admin, password: '' })));
      } else {
        setError(data.message || 'Unable to load admins.');
      }
    } catch (err) {
      console.error('Failed to load admins', err);
      setError('Unable to load admins right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (adminID, field, value) => {
    setAdmins(prev => prev.map(admin => admin.adminID === adminID ? { ...admin, [field]: value } : admin));
  };

  const handleSave = async (admin) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:3001/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminID: admin.adminID, fullName: admin.fullName, password: admin.password })
      });
      const data = await response.json();
      if (data.valid) {
        setSuccess('Admin updated successfully.');
        setAdmins(prev => prev.map(item => item.adminID === admin.adminID ? { ...item, password: '' } : item));
      } else {
        setError(data.message || 'Unable to update admin.');
      }
    } catch (err) {
      console.error('Admin update failed', err);
      setError('Unable to update admin right now.');
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#ffffff', borderRadius: 16, padding: '2rem', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}>
        <h2 style={{ marginTop: 0 }}>Admin Settings</h2>
        <p style={{ color: '#475467' }}>Update existing admin full names and optionally change passwords for admin accounts.</p>

        {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
        {success && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#d1fae5', color: '#166534' }}>{success}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0 }}>Existing Admins</h3>
          <button type="button" onClick={fetchAdmins} className="btn btn-outline-secondary">Refresh</button>
        </div>

        {loading ? (
          <div>Loading admins...</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {admins.map((admin) => (
              <div key={admin.adminID} style={{ padding: 16, borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ marginBottom: 12, display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 220px' }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Email</label>
                      <input className="input-text" type="text" value={admin.email} disabled style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: '1 1 220px' }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Full Name</label>
                      <input className="input-text" type="text" value={admin.fullName || ''} onChange={(event) => handleChange(admin.adminID, 'fullName', event.target.value)} placeholder="Full name" style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: '1 1 220px' }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>New Password</label>
                      <input className="input-text" type="password" value={admin.password || ''} onChange={(event) => handleChange(admin.adminID, 'password', event.target.value)} placeholder="Leave blank to keep current" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => handleSave(admin)}>Save Changes</button>
              </div>
            ))}
            {admins.length === 0 && <div>No admins found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
