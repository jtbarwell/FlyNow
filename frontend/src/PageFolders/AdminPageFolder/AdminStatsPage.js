import React, { useEffect, useState } from 'react';

//Placeholder stats until information finalized
export default function AdminStatsPage() {
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [flightsPerTimePeriod, setFlightsPerTimePeriod] = useState(null);
  const [bookingsPerAirline, setBookingsPerAirline] = useState([]);

  useEffect(() => {
      fetch('http://localhost:3001/api/admin/flights/stats', {
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            setPopularRoutes(data.body.bookingsPerRoute);
            setFlightsPerTimePeriod(data.body.flightsPerTimePeriod);
            setBookingsPerAirline(data.body.bookingsPerAirline);
          }
        })
        .catch((error) => {
          console.error('Unable to load flight statistics', error);
        });
  }, []);

  const popular = [
    { id: 1, title: popularRoutes[0]?.name, route: `${popularRoutes[0]?.origin} → ${popularRoutes[0]?.destination}`, count: popularRoutes[0]?.count },
    { id: 2, title: popularRoutes[1]?.name, route: `${popularRoutes[1]?.origin} → ${popularRoutes[1]?.destination}`, count: popularRoutes[1]?.count },
    { id: 3, title: popularRoutes[2]?.name, route: `${popularRoutes[2]?.origin} → ${popularRoutes[2]?.destination}`, count: popularRoutes[2]?.count },
    { id: 4, title: popularRoutes[3]?.name, route: `${popularRoutes[3]?.origin} → ${popularRoutes[3]?.destination}`, count: popularRoutes[3]?.count },
    { id: 5, title: popularRoutes[4]?.name, route: `${popularRoutes[4]?.origin} → ${popularRoutes[4]?.destination}`, count: popularRoutes[4]?.count },
  ];

  const byTime = [
    { id: 'morning', label: 'Morning (5am–12pm)', count: flightsPerTimePeriod?.Morning },
    { id: 'afternoon', label: 'Afternoon (12pm–5pm)', count: flightsPerTimePeriod?.Afternoon },
    { id: 'evening', label: 'Evening (5pm–12am)', count: flightsPerTimePeriod?.Evening },
    { id: 'overnight', label: 'Overnight (12am–5am)', count: flightsPerTimePeriod?.Overnight },
  ];

  const FlightRow = ({ f }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff', borderRadius: 12, border: '1px solid #efe7ef' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#efe8f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c5fbe', fontSize: 20 }}>
       ✈
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

  function BarChart({ data }) {
    const maxHeight = Math.max(...data.map(d => d.count));

    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '15px', padding: '10px', backgroundColor: '#efe8f9', borderRadius: '15px' }}>
        {data.map((item, index) => {
          const heightPercent = (item.count / maxHeight) * 100;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', marginBottom: '5px' }}>{item.count}</span>
              <div style={{ width: '30px', height: `${heightPercent}%`, backgroundColor: '#7c5fbe', borderRadius: '4px 4px 0 0' }} />
              <span style={{ fontSize: '12px', marginTop: '5px' }}>{item.airline}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: 20, display: 'flex', justifyContent: 'center' }}>
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
              <div key={t.id} style={{ borderRadius: 12, padding: '12px 14px', background: '#fff', border: '1px solid #efe7ef', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>{t.count}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{t.label}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 18 }} />
          <h4 style={{ margin: 0, marginBottom: 12 }}>Bookings By Airline</h4>
          <BarChart data={bookingsPerAirline}></BarChart>
        </div>
      </div>
    </div>
  );
}
