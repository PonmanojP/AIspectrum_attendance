import React, { useState } from 'react';
import './App.css';
import Tabs from './components/Tabs';
import AttendanceTab from './components/AttendanceTab';
import RegistrationTab from './components/RegistrationTab';
import Presenters from './components/PresentersAttendanceTab'; // added

const App = () => {
  const [active, setActive] = useState('attendance');

  return (
    <div className="app">
      <div className="header">
        <h1>AI Spectrum - Onsite Portal</h1>
      </div>

      <Tabs
        active={active}
        setActive={setActive}
        items={[
          { id: 'presenters', label: 'Presenters' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'registration', label: 'New Registration' }
        ]}
      />

      {active === 'attendance' && <AttendanceTab />}
      {active === 'registration' && <RegistrationTab />}
      {active === 'presenters' && <Presenters />} {/* render PresentersTab */}
    </div>
  );
};

export default App;