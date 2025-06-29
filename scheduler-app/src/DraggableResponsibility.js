// src/components/DraggableResponsibility.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';

export default function DraggableResponsibility({ resp, onDelete }) {
    const [{ isDragging }, dragRef] = useDrag({
        type: resp.type === 'director' ? 'RESP_DIRECTOR' : 'RESP_UTILITY',
        item: { id: resp._id },
        collect: m => ({ isDragging: m.isDragging() }),
    });

    return (
        <li
            ref={dragRef}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                marginBottom: '.5rem',
                padding: '.5rem',
                border: '1px solid #ccc',
            }}
        >
            <span style={{ flex: 1 }}>
                {resp.type === 'director' ? 'Director of' : 'Utility of'} {resp.show}
            </span>
            <button onClick={() => onDelete(resp._id)}>✕</button>
        </li>
    );
}

DraggableResponsibility.propTypes = {
    resp: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['director', 'utility']).isRequired,
        show: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};
