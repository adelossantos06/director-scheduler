// src/App.js
import React, { useState, useEffect } from 'react';
import AddDirector from './AddDirector';
import EmployeeCard from './EmployeeCard';
import AddShift from './AddShift';
import DraggableShift from './DraggableShift';
import './App.css';

export default function App() {
  const [showDirectorForm, setShowDirectorForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [directors, setDirectors] = useState([]);
  const [shifts, setShifts] = useState([]);

  // load directors
  const loadDirectors = () => {
    fetch('http://localhost:8000/api/names')
      .then(res => res.json())
      .then(setDirectors)
      .catch(console.error);
  };

  // load shifts
  const loadShifts = () => {
    fetch('http://localhost:8000/api/shifts')
      .then(r => r.json())
      .then(data => {
        setShifts(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadDirectors();
    loadShifts();
  }, []);

  const handleDirectorAdded = () => {
    setShowDirectorForm(false);
    loadDirectors();
  };

  const handleShiftAdded = () => {
    setShowShiftForm(false);
    loadShifts();
  };

  // Assign a shift to a director
  const handleAssign = (directorId, shiftId) => {
    fetch(`http://localhost:8000/api/shifts/${shiftId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId }),
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(() => {
        loadDirectors();
        loadShifts();
      })
      .catch(err => console.error('Error assigning shift:', err));
  };

  // delete a shift completely
  const handleDeleteShift = (shiftId) => {
    if (!window.confirm('Delete this shift?')) return;
    fetch(`http://localhost:8000/api/shifts/${shiftId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        loadShifts();
      })
      .catch(err => console.error('Error deleting shift:', err));
  };
  // Unassign (remove) a shift from a director
  const handleUnassignShift = (directorId, shiftId) => {
    fetch(`http://localhost:8000/api/shifts/${shiftId}/unassign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId }),
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(() => loadShifts())
      .catch(err => console.error('Error unassigning shift:', err));
  };

  return (
    <div className="app">
      <h1>KENS5 DIRECTOR SCHEDULER</h1>

      <div style={{ padding: '2rem' }}>
        {!showDirectorForm && !showShiftForm && (
          <>
            <button onClick={() => { setShowDirectorForm(true); setShowShiftForm(false); }}>
              Add Director
            </button>
            <button onClick={() => { setShowShiftForm(true); setShowDirectorForm(false); }}>
              Add Shift
            </button>
          </>
        )}

        {showDirectorForm && <AddDirector onSuccess={handleDirectorAdded} />}
        {showShiftForm && <AddShift onSuccess={handleShiftAdded} />}
      </div>

      <div style={{ display: 'flex', gap: '2rem', padding: '1rem 2rem' }}>
        {/* Shifts column */}
        <div style={{ flex: 1 }}>
          <h2>Shifts</h2>
          {shifts.length === 0 ? (
            <p>No shifts yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {shifts.map(s => (
                <DraggableShift
                  key={s._id}
                  shift={s}
                  onDelete={handleDeleteShift}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Directors column */}
        <div style={{ flex: 1 }}>
          <h2>Directors</h2>
          {directors.map(d => (
            <EmployeeCard
              key={d._id}
              id={d._id}
              name={d.name}
              assignedShifts={shifts.filter(s =>
                s.directors?.some(dir => dir.toString() === d._id)
              )}
              onChange={loadDirectors}
              onAssign={handleAssign}
              onUnassignShift={handleUnassignShift}
            />
          ))}
        </div>
      </div>
    </div>
  );
}