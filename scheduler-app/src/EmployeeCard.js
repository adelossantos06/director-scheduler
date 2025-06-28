// src/components/EmployeeCard.jsx
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import PropTypes from 'prop-types';

export default function EmployeeCard({
    id,
    name,
    assignedShifts = [],
    onChange,
    onAssign,
    onUnassignShift
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);

    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept: 'SHIFT',
        drop: ({ id: shiftId }) => onAssign(id, shiftId),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const handleDeleteDirector = async () => {
        if (!window.confirm(`Really delete “${name}”?`)) return;
        const res = await fetch(`/api/names/${id}`, { method: 'DELETE' });
        if (res.ok) onChange();
        else alert('Delete failed');
    };

    const handleSaveName = async () => {
        if (!draftName.trim()) {
            alert('Name cannot be empty');
            return;
        }
        const res = await fetch(`/api/names/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: draftName.trim() }),
        });
        if (res.ok) {
            setIsEditing(false);
            onChange();
        } else {
            alert('Update failed');
        }
    };

    return (
        <div
            ref={dropRef}
            className="employee-card"
            style={{
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '1rem',
                backgroundColor: isOver && canDrop ? '#e0ffe0' : 'white',
            }}
        >
            {isEditing ? (
                <>
                    <input
                        value={draftName}
                        onChange={e => setDraftName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        autoFocus
                    />
                    <button onClick={handleSaveName}>Save</button>
                    <button onClick={() => { setIsEditing(false); setDraftName(name); }}>
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <strong>{name}</strong>{' '}
                    <button onClick={() => setIsEditing(true)}>Edit</button>{' '}
                    <button onClick={handleDeleteDirector}>Delete</button>
                </>
            )}

            <div className="details" style={{ marginTop: '0.5rem' }}>
                {assignedShifts.length > 0 ? (
                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {assignedShifts.map(s => (
                            <li
                                key={s._id}
                                style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}
                            >
                                <span style={{ flex: 1 }}>
                                    {s.start} — {s.end}
                                </span>
                                <button
                                    onClick={() => onUnassignShift(id, s._id)}
                                    style={{
                                        marginLeft: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#900',
                                        cursor: 'pointer',
                                    }}
                                    title="Unassign shift"
                                >
                                    ↩
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontStyle: 'italic', margin: 0 }}>
                        No shifts assigned
                    </p>
                )}
            </div>
        </div>
    );
}

EmployeeCard.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    assignedShifts: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            start: PropTypes.string.isRequired,
            end: PropTypes.string.isRequired,
        })
    ),
    onChange: PropTypes.func.isRequired,
    onAssign: PropTypes.func.isRequired,     // (directorId, shiftId)
    onUnassignShift: PropTypes.func.isRequired,     // (directorId, shiftId)
};