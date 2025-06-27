import React, { useState } from 'react';

function AddDirector() {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;

        try {
            const response = await fetch('http://localhost:8000/api/names', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                setStatus('Director added successfully!');
                setName('');
            } else {
                setStatus('Failed to add director.');
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('An error occurred.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* <h2>Add Director</h2> */}
            <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter director's name"
            />
            <button type="submit">Add</button>
            <p>{status}</p>
        </form>
    );
}



export default AddDirector;