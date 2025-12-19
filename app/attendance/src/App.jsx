import React, { useState } from 'react';
import './App.css';
import Tabs from './components/Tabs';
import AttendanceTab from './components/AttendanceTab';
import RegistrationTab from './components/RegistrationTab';
import Presenters from './components/PresentersAttendanceTab';
import PSGStudentsRegistrationTab from './components/PSGStudentsRegistrationTab';

const App = () => {
  const [active, setActive] = useState('attendance');

  const tabItems = [
    { id: 'presenters', label: 'Presenters', content: <Presenters /> },
    { id: 'attendance', label: 'Attendee', content: <AttendanceTab /> },
    { id: 'registration', label: 'New Registration', content: <RegistrationTab /> },
    { id: 'psg-students', label: 'PSG Students Registration', content: <PSGStudentsRegistrationTab /> }
  ];

  return (
    <div className="app">
      <div className="header">
        <h1>AI Spectrum - Onsite Portal</h1>
      </div>

      <div className="tabs-container">
        <Tabs
          active={active}
          setActive={setActive}
          items={tabItems.map(item => ({ id: item.id, label: item.label }))}
        />
        
        <div className="tab-content-wrapper">
          {tabItems.map(item => (
            <div
              key={item.id}
              className={`tab-content ${active === item.id ? 'active' : ''}`}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;