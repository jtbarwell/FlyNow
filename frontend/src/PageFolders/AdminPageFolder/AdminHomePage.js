import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHomePage() {
  const navigate = useNavigate();

  const Item = ({ label, onClick, Icon }) => (
    <button onClick={onClick} className="admin-item" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '1rem 0', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        {Icon && <Icon />}
      </div>
      <div style={{ flex: 1, color: '#0f1724' }}>{label}</div>
      <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </button>
  );

  const IconProfile = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#667085" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#667085" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  const IconFlights = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12l20-7-7 20-3-7-4-6z" stroke="#667085" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
  );
  const IconStats = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="#667085" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 13v6M12 9v10M17 5v14" stroke="#667085" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  const IconSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" stroke="#667085" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 112.28 16.9l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09c.7 0 1.26-.4 1.51-1a1.65 1.65 0 00-.33-1.82L4.3 4.28A2 2 0 116.13 2.45l.06.06a1.65 1.65 0 001.82.33h.09c.6-.2 1.2-.2 1.8 0h.09a1.65 1.65 0 001.82-.33l.06-.06A2 2 0 1117.72 4.3l-.06.06a1.65 1.65 0 00-.33 1.82v.09c.2.6.2 1.2 0 1.8v.09c.3.9 1 1.5 1.8 1.8h.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09c-.7 0-1.26.4-1.51 1z" stroke="#667085" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: '#ffffff', borderRadius: 18, padding: '24px 20px', boxShadow: '0 8px 20px rgba(2,6,23,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 140, height: 140, borderRadius: 32, background: '#f6dce6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="74" height="74" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.5" stroke="#5b2e36" strokeWidth="1.8"/><path d="M5 20c1.5-3.5 6-5 7-5s5.5 1.5 7 5" stroke="#5b2e36" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 18, color: '#374151', fontWeight: 600 }}>Employee Name</div>
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
