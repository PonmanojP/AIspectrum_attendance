import React, { useEffect, useState } from 'react';
import api from '../services/api';

const PeopleTab = () => {
  const [data, setData] = useState({ registered: [], onsite: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/people');
        setData(res.data || { registered: [], onsite: [] });
      } catch (err) {
        console.error(err);
        setError('Failed to load people');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderList = (title, list) => (
    <div className="people-card">
      <h3>{title} ({list.length})</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Mobile</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => (
            <tr key={i}>
              <td>{p.name || '-'}</td>
              <td>{p.mobile || '-'}</td>
              <td>{p.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2>People</h2>
      {loading && <div className="small">Loading…</div>}
      {error && <div className="small">{error}</div>}
      <div className="people-grid">
        {renderList('Registered (original CSV)', data.registered)}
        {renderList('Onsite / New Registrations', data.onsite)}
      </div>
    </div>
  );
};

export default PeopleTab;