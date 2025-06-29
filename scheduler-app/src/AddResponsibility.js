// src/components/AddResponsibility.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function AddResponsibility({ onSuccess }) {
    const [type, setType] = useState('director');
    const [show, setShow] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        if (!show.trim()) return alert('Show name is required.');

        const res = await fetch('http://localhost:8000/api/responsibilities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, show: show.trim() }),
        });

        if (res.ok) {
            setShow('');
            onSuccess();
        } else {
            alert('Create failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <select
                value={type}
                onChange={e => setType(e.target.value)}
            >
                <option value="director">Director of</option>
                <option value="utility">Utility of</option>
            </select>

            <input
                placeholder="Show name"
                value={show}
                onChange={e => setShow(e.target.value)}
                required
            />

            <button type="submit">Add Responsibility</button>
        </form>
    );
}

AddResponsibility.propTypes = {
    onSuccess: PropTypes.func.isRequired,
};

