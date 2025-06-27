// src/components/EmployeeCard.jsx
import React, { useState } from 'react';

export default function EmployeeCard({ id, name, onChange }) {
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);

    const handleDelete = async () => {
        if (!window.confirm(`Really delete “${name}”?`)) return;
        const res = await fetch(`http://localhost:8000/api/names/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) onChange();
        else alert('Delete failed');
    };

    const handleSave = async () => {
        if (!draftName.trim()) {
            alert('Name cannot be empty');
            return;
        }
        const res = await fetch(`http://localhost:8000/api/names/${id}`, {
            method: 'PATCH',                          // partial update
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: draftName }) // only sending the changed field
        });
        if (res.ok) {
            setIsEditing(false);
            onChange();
        } else {
            alert('Update failed');
        }
    };

    return (
        <div className="employee-card">
            {isEditing ? (
                <>
                    <input
                        value={draftName}
                        onChange={e => setDraftName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => { setIsEditing(false); setDraftName(name); }}>
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <strong>{name}</strong>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </>
            )}
            <div className="details">
                {/* TODO: render shift times & responsibilities here */}
            </div>
        </div>
    );
}