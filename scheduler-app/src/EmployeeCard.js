// src/components/EmployeeCard.jsx
import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import PropTypes from 'prop-types';

export default function EmployeeCard({
    id,
    name,
    assignedShifts = [],
    assignedResponsibilities = [],
    onChange,
    onAssign,
    onUnassignShift,
    onAssignResponsibility,
    onUnassignResponsibility,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);

    // Make the whole card draggable as a DIRECTOR
    const [{ isDragging }, dragRef] = useDrag({
        type: 'DIRECTOR',             // this string …
        item: { directorId: id },     // … must match the drop target
        collect: m => ({ isDragging: m.isDragging() })
    });

    // Drop target for shifts
    const [{ isOverShift, canDropShift }, dropShiftRef] = useDrop({
        accept: 'SHIFT',
        drop: ({ id: shiftId }) => onAssign(id, shiftId),
        collect: monitor => ({
            isOverShift: monitor.isOver(),
            canDropShift: monitor.canDrop(),
        }),
    });

    // Drop target for director-type responsibilities
    const [{ isOverRespDir }, dropRespDirRef] = useDrop({
        accept: 'RESP_DIRECTOR',
        drop: ({ id: respId, shift }) => onAssignResponsibility(id, shift, respId),
        collect: m => ({ isOverRespDir: m.isOver() }),
    });

    // Drop target for utility-type responsibilities
    const [{ isOverRespUtil }, dropRespUtilRef] = useDrop({
        accept: 'RESP_UTILITY',
        drop: ({ id: respId, shift }) => onAssignResponsibility(id, shift, respId),
        collect: m => ({ isOverRespUtil: m.isOver() }),
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
            // Compose drag and drop refs so the card is both draggable and a shift drop target
            ref={node => dragRef(dropShiftRef(node))}
            className="employee-card"
            style={{
                opacity: isDragging ? 0.5 : 1,
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '1rem',
                backgroundColor: isOverShift && canDropShift ? '#e0ffe0' : 'white',
                cursor: isDragging ? 'grabbing' : 'grab',
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
                    <strong>{name}</strong> {' '}
                    <button onClick={() => setIsEditing(true)}>Edit</button> {' '}
                    <button onClick={handleDeleteDirector}>Delete</button>
                </>
            )}

            {/* Shifts */}
            <div className="details" style={{ marginTop: '0.5rem' }}>
                <h4>Shifts</h4>
                {assignedShifts.length > 0 ? (
                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {assignedShifts.map(s => (
                            <li key={s._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ flex: 1 }}>{s.start} — {s.end}</span>
                                <button
                                    onClick={() => onUnassignShift(id, s._id)}
                                    style={{ marginLeft: '0.5rem', background: 'transparent', border: 'none', color: '#900', cursor: 'pointer' }}
                                    title="Unassign shift"
                                >↩</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontStyle: 'italic', margin: 0 }}>No shifts assigned</p>
                )}
            </div>

            {/* Responsibilities */}
            <div className="details" style={{ marginTop: '0.5rem' }}>
                <h4>Responsibilities</h4>
                <div ref={dropRespDirRef} style={{ padding: '0.5rem', border: isOverRespDir ? '2px dashed green' : '2px dashed transparent' }}>
                    <strong>Director of:</strong>
                    {assignedResponsibilities.filter(r => r.type === 'director').length > 0 ? (
                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                            {assignedResponsibilities.filter(r => r.type === 'director').map(r => (
                                <li key={r._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ flex: 1 }}>{r.show}</span>
                                    <button
                                        onClick={() => onUnassignResponsibility(id, r.shift, r._id)}
                                        style={{ marginLeft: '0.5rem', background: 'transparent', border: 'none', color: '#900', cursor: 'pointer' }}
                                        title="Unassign responsibility"
                                    >↩</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ fontStyle: 'italic', margin: 0 }}>None</p>
                    )}
                </div>
                <div ref={dropRespUtilRef} style={{ padding: '0.5rem', border: isOverRespUtil ? '2px dashed green' : '2px dashed transparent', marginTop: '0.5rem' }}>
                    <strong>Utility of:</strong>
                    {assignedResponsibilities.filter(r => r.type === 'utility').length > 0 ? (
                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                            {assignedResponsibilities.filter(r => r.type === 'utility').map(r => (
                                <li key={r._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ flex: 1 }}>{r.show}</span>
                                    <button
                                        onClick={() => onUnassignResponsibility(id, r.shift, r._id)}
                                        style={{ marginLeft: '0.5rem', background: 'transparent', border: 'none', color: '#900', cursor: 'pointer' }}
                                        title="Unassign responsibility"
                                    >↩</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ fontStyle: 'italic', margin: 0 }}>None</p>
                    )}
                </div>
            </div>
        </div>
    );
}

EmployeeCard.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    assignedShifts: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
    })),
    assignedResponsibilities: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        shift: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['director', 'utility']).isRequired,
        show: PropTypes.string.isRequired,
    })),
    onChange: PropTypes.func.isRequired,
    onAssign: PropTypes.func.isRequired,
    onUnassignShift: PropTypes.func.isRequired,
    onAssignResponsibility: PropTypes.func.isRequired,
    onUnassignResponsibility: PropTypes.func.isRequired,
};
