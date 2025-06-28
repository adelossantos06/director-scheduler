// src/components/DraggableShift.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';

export default function DraggableShift({ shift, onDelete }) {
    const [{ isDragging }, dragRef] = useDrag({
        type: 'SHIFT',
        item: { id: shift._id },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const handleDelete = e => {
        e.stopPropagation();
        if (typeof onDelete === 'function') {
            onDelete(shift._id);
        }
    };

    return (
        <li
            ref={dragRef}
            style={{
                display: 'flex',
                alignItems: 'center',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                padding: '0.5rem',
                border: '1px solid #ccc',
                marginBottom: '.25rem',
                background: '#fafafa',
            }}
        >
            <span style={{ flex: 1 }}>
                {shift.start} — {shift.end}
            </span>
            <button
                onClick={handleDelete}
                style={{
                    marginLeft: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#900',
                    cursor: 'pointer',
                }}
                title="Delete shift"
            >
                ✕
            </button>
        </li>
    );
}

DraggableShift.propTypes = {
    shift: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

