// src/App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AddDirector from './AddDirector';
import EmployeeCard from './EmployeeCard';
import AddShift from './AddShift';
import DraggableShift from './DraggableShift';
import AddResponsibility from './AddResponsibility';
import DraggableResponsibility from './DraggableResponsibility';
import Calendar from './Calendar';
import './App.css';

export default function App() {
  const [showDirectorForm, setShowDirectorForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [directors, setDirectors] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [responsibilities, setResponsibilities] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().slice(0, 10);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString().slice(0, 10);

  const [range] = useState({ from: firstOfMonth, to: lastOfMonth });

  const responsibilitiesByDirector = useMemo(() => {
    return responsibilities.reduce((map, resp) => {
      (resp.directors || []).forEach(dirId => {
        if (!map[dirId]) map[dirId] = [];
        map[dirId].push(resp);
      });
      return map;
    }, {});
  }, [responsibilities]);

  // your callback loader
  const loadSchedules = useCallback((from, to) => {
    fetch(`http://localhost:8000/api/schedules?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(setSchedules)
      .catch(console.error);
  }, []);

  console.log(schedules)
  // Load all directors
  const loadDirectors = useCallback(() => {
    fetch('http://localhost:8000/api/names')
      .then(r => r.json())
      .then(setDirectors)
      .catch(console.error);
  }, []);

  // Load all shifts
  const loadShifts = useCallback(() => {
    fetch('http://localhost:8000/api/shifts')
      .then(r => r.json())
      .then(setShifts)
      .catch(console.error);
  }, []);

  // Load all responsibilities
  const loadResponsibilities = useCallback(() => {
    fetch('http://localhost:8000/api/responsibilities')
      .then(r => r.json())
      .then(setResponsibilities)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadDirectors();
    loadShifts();
    loadResponsibilities();
    loadSchedules(range.from, range.to);
  }, [
    loadDirectors,
    loadShifts,
    loadResponsibilities,
    loadSchedules,
    range.from,
    range.to
  ]);

  // 2) Handler to create a schedule
  const handleScheduleCreate = (directorId, dateIso, shiftId) => {
    fetch('http://localhost:8000/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId, date: dateIso, shift: shiftId })
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
        // reload exactly the same interval
        loadSchedules(range.from, range.to);
      })
      .catch(err => alert(err.message));
  };

  const handleScheduleUpdate = (scheduleId, updates) => {
    fetch(`http://localhost:8000/api/schedules/${scheduleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
        // reload the same month range after a successful update
        loadSchedules(range.from, range.to);
      })
      .catch(err => {
        alert('Error updating schedule: ' + err.message);
        console.error(err);
      });
  };

  // DELETE a schedule entry
  const handleScheduleDelete = scheduleId => {
    if (!window.confirm('Remove this director from the calendar?')) return;
    fetch(`http://localhost:8000/api/schedules/${scheduleId}`, {
      method: 'DELETE'
    })
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        // reload the same month range
        loadSchedules(range.from, range.to);
      })
      .catch(err => alert('Error removing schedule: ' + err.message));
  };


  // After adding a director
  const handleDirectorAdded = () => {
    setShowDirectorForm(false);
    loadDirectors();
  };

  // After adding a shift
  const handleShiftAdded = () => {
    setShowShiftForm(false);
    loadShifts();
  };

  // Handlers for shifts
  const handleAssignShift = (directorId, shiftId) => {
    fetch(`http://localhost:8000/api/shifts/${shiftId}/assign`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId })
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(() => { loadDirectors(); loadShifts(); })
      .catch(console.error);
  };
  const handleDeleteShift = shiftId => {
    if (!window.confirm('Delete this shift?')) return;
    fetch(`http://localhost:8000/api/shifts/${shiftId}`, { method: 'DELETE' })
      .then(r => r.ok ? loadShifts() : Promise.reject(r.statusText))
      .catch(console.error);
  };
  const handleUnassignShift = (directorId, shiftId) => {
    fetch(`http://localhost:8000/api/shifts/${shiftId}/unassign`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId })
    })
      .then(r => r.ok ? loadShifts() : Promise.reject(r.statusText))
      .catch(console.error);
  };

  // Handlers for responsibilities
  const handleAssignResponsibility = (directorId, shiftId, respId) => {
    fetch(`http://localhost:8000/api/responsibilities/${respId}/assign`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId })
    })
      .then(r => r.ok ? loadResponsibilities() : Promise.reject(r.statusText))
      .catch(console.error);
  };
  const handleDeleteResponsibility = respId => {
    if (!window.confirm('Delete this responsibility?')) return;
    fetch(`http://localhost:8000/api/responsibilities/${respId}`, { method: 'DELETE' })
      .then(r => r.ok ? loadResponsibilities() : Promise.reject(r.statusText))
      .catch(console.error);
  };
  const handleUnassignResponsibility = (directorId, shiftId, respId) => {
    fetch(`http://localhost:8000/api/responsibilities/${respId}/unassign`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorId })
    })
      .then(r => r.ok ? loadResponsibilities() : Promise.reject(r.statusText))
      .catch(console.error);
  };

  return (
    <div className="app">
      <h1>KENS5 DIRECTOR SCHEDULER</h1>

      { /* … your AddDirector / AddShift toolbar … */}

      { /* Instead of your old panels, render the calendar: */}
      <Calendar
        schedules={schedules}
        directors={directors}
        shifts={shifts}
        responsibilitiesByDirector={responsibilitiesByDirector}
        onScheduleCreate={handleScheduleCreate}
        onScheduleUpdate={handleScheduleUpdate}
        onScheduleDelete={handleScheduleDelete}
      />

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

      <div style={{ display: 'flex', gap: '2rem', padding: '1rem 2rem', alignItems: 'flex-start' }}>
        {/* Shifts Pool */}
        <div style={{ flex: 1 }}>
          <h2>Shifts</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {shifts.map(s => (
              <DraggableShift
                key={s._id}
                shift={s}
                onDelete={handleDeleteShift}
              />
            ))}
          </ul>
        </div>

        {/* Responsibilities Pool */}
        <div style={{ flex: 1 }}>
          <h2>Responsibilities</h2>
          <AddResponsibility
            shifts={shifts}
            onSuccess={loadResponsibilities}
          />
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {responsibilities.map(r => (
              <DraggableResponsibility
                key={r._id}
                resp={r}
                shiftId={r.shift}
                onDelete={() => handleDeleteResponsibility(r._id)}
              />
            ))}
          </ul>
        </div>

        {/* Directors Column */}
        <div style={{ flex: 1 }}>
          <h2>Directors</h2>
          {directors.map(d => (
            <EmployeeCard
              key={d._id}
              id={d._id}
              name={d.name}

              // Shift assignments
              assignedShifts={shifts.filter(s => s.directors?.includes(d._id))}
              onAssign={handleAssignShift}
              onUnassignShift={handleUnassignShift}

              // Responsibility assignments
              assignedResponsibilities={responsibilities.filter(r => (r.directors || []).includes(d._id))}
              onAssignResponsibility={handleAssignResponsibility}
              onUnassignResponsibility={handleUnassignResponsibility}

              onChange={loadDirectors}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
