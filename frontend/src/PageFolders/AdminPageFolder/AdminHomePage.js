import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminFullName') || 'Admin';
    }
    return 'Admin';
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/me', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.valid && data.admin) {
          const name = data.admin.fullName || data.admin.email || 'Admin';
          setAdminName(name);
          if (typeof window !== 'undefined') {
            localStorage.setItem('adminFullName', name);
          }
        }
      })
      .catch((error) => {
        console.error('Unable to load admin profile', error);
      });
  }, []);

  const Item = ({ label, onClick, Icon }) => (
    <button onClick={onClick} className="admin-item" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '1rem 0', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, color: '#7c5fbe', fontSize: 18 }}>
        {Icon && <Icon />}
      </div>
      <div style={{ flex: 1, color: '#0f1724' }}>{label}</div>
      <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </button>
  );

  const IconProfile = () => (
    <h4>&#x263B;</h4>
  );
  const IconFlights = () => (
    <h4>&#x2708;</h4>
  );
  const IconStats = () => (
    <h4>&#x2611;</h4>
  );
  const IconSettings = () => (
    <h4>&#x2699;</h4>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: '#ffffff', borderRadius: 18, padding: '24px 20px', boxShadow: '0 8px 20px rgba(2,6,23,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 140, height: 140, borderRadius: 32, background: '#efe8f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="74" height="74" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.5" stroke="#7c5fbe" strokeWidth="1.8"/><path d="M5 20c1.5-3.5 6-5 7-5s5.5 1.5 7 5" stroke="#7c5fbe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 18, color: '#374151', fontWeight: 600 }}>{adminName}</div>
          </div>

          <div style={{ marginTop: 8 }}>
            <Item label="Personal Information" onClick={() => navigate('/admin/personal-info')} Icon={IconProfile} />
            <hr style={{ border: 'none', borderTop: '1px solid #eef2f6', margin: 0 }} />
            <Item label="Managed Flights" onClick={() => navigate('/admin/flights')} Icon={IconFlights} />
            <hr style={{ border: 'none', borderTop: '1px solid #eef2f6', margin: 0 }} />
            <Item label="Flight Statistics" onClick={() => navigate('/admin/stats')} Icon={IconStats} />
            <hr style={{ border: 'none', borderTop: '1px solid #eef2f6', margin: 0 }} />
            <Item label="Settings" onClick={() => navigate('/admin/settings')} Icon={IconSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}
