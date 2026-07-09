import React from 'react';

//Placeholder stats until information finalized
export default function AdminStatsPage() {
  const popular = [
    { id: 1, title: 'Air Canada 317', route: 'YYZ → LAX', count: 1129 },
    { id: 2, title: 'Delta Airlines 3815', route: 'YYZ → ORD', count: 1122 },
    { id: 3, title: 'Air Canada 808', route: 'YKF → YOW', count: 1107 },
    { id: 4, title: 'WestJet 271', route: 'YOW → YKF', count: 1086 },
    { id: 5, title: 'Flair Airlines 34567', route: 'YKF → YYZ', count: 1082 },
  ];

  const byTime = [
    { id: 'morning', label: 'Morning (5am–11am)', count: 421 },
    { id: 'afternoon', label: 'Afternoon (11am–5pm)', count: 812 },
    { id: 'evening', label: 'Evening (5pm–11pm)', count: 536 },
    { id: 'overnight', label: 'Overnight (11pm–5am)', count: 98 },
  ];

  const FlightRow = ({ f }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fbf8fb', borderRadius: 12, border: '1px solid #efe7ef' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3e8ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <h4>&#x2708;</h4>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#111827' }}>{f.title}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{f.route}</div>
      </div>
      <div style={{ marginLeft: 12 }}>
        <div style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #e6dfea', background: '#fff' }}>{f.count}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: 20, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: '#ffffff', borderRadius: 14, padding: 18, boxShadow: '0 6px 18px rgba(2,6,23,0.06)', marginBottom: 18 }}>
          <h3 style={{ margin: 0, marginBottom: 12 }}>Most Popular Flights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {popular.map(p => (
              <FlightRow key={p.id} f={p} />
            ))}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 14, padding: 18, boxShadow: '0 6px 18px rgba(2,6,23,0.06)' }}>
          <h3 style={{ margin: 0, marginBottom: 12 }}>Flights By Time</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {byTime.map(t => (
              <div key={t.id} style={{ borderRadius: 12, padding: '12px 14px', background: '#fbf8fb', border: '1px solid #efe7ef', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>{t.count}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{t.label}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 18 }} />
          <h4 style={{ margin: 0, marginBottom: 12 }}>Bookings By Airline</h4>
          <div style={{ borderRadius: 12, height: 120, background: '#f3e8ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Chart / breakdown placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
