import React, { useState } from 'react';
import AddDirector from './AddDirector'
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <h1>KENS5 DIRECTOR SCHEDULER</h1>
      <div style={{ padding: '2rem' }}>

        {!showForm ? (
          <button onClick={() => setShowForm(true)}>
            Add Director
          </button>
        ) : (
          <AddDirector />
        )}
      </div>
    </div>
  );
}

export default App;
