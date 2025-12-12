import React, { useState } from 'react';
import './App.css';
import Tabs from './components/Tabs';
import AttendanceTab from './components/AttendanceTab';
import RegistrationTab from './components/RegistrationTab';
import PeopleTab from './components/PeopleTab'; // added

const App = () => {
  const [active, setActive] = useState('attendance');

  return (
    <div className="app">
      <div className="header">
        <h1>AI Spectrum - Onsite Portal</h1>
        <div className="small">Backend: http://localhost:5000</div>
      </div>

      <Tabs
        active={active}
        setActive={setActive}
        items={[
          { id: 'attendance', label: 'Attendance' },
          { id: 'registration', label: 'New Registration' },
          { id: 'people', label: 'People' } // new tab
        ]}
      />

      {active === 'attendance' && <AttendanceTab />}
      {active === 'registration' && <RegistrationTab />}
      {active === 'people' && <PeopleTab />} {/* render PeopleTab */}
    </div>
  );
};

export default App;