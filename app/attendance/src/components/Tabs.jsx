import React, { useState } from 'react';
import AttendanceTab from './AttendanceTab';
import RegistrationTab from './RegistrationTab';

const Tabs = ({ items, active, setActive }) => {
  return (
    <div className="tabs" role="tablist" aria-label="Main tabs">
      {items.map(i => (
        <button
          key={i.id}
          role="tab"
          aria-selected={active === i.id}
          className={`tab ${active === i.id ? 'active' : ''}`}
          onClick={() => setActive(i.id)}
          type="button"
        >
          {i.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;