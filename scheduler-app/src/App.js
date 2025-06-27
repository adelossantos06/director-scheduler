import React, { useState, useEffect } from 'react';
import AddDirector from './AddDirector'
import EmployeeCard from './EmployeeCard';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [directors, setDirectors] = useState([]);

  const loadDirectors = () => {
    fetch('http://localhost:8000/api/names')
      .then(res => res.json())
      .then(data => setDirectors(data))
      .catch(console.error);
  };
  useEffect(loadDirectors, []);

  const handleAdded = () => {
    setShowForm(false);
    loadDirectors();
  };

  return (
    <div className="app">
      <h1>KENS5 DIRECTOR SCHEDULER</h1>

      <div style={{ padding: '2rem' }}>
        {!showForm ? (
          <button onClick={() => setShowForm(true)}>Add Director</button>
        ) : (
          <AddDirector onSuccess={handleAdded} />
        )}
      </div>

      <div className="employee-list" style={{ padding: '1rem 2rem' }}>
        {directors.map(dir => (
          <EmployeeCard
            key={dir._id}
            id={dir._id}                // ← here
            name={dir.name}
            onChange={loadDirectors}    // ← and here
          />
        ))}
      </div>
    </div>
  );
}

export default App;
