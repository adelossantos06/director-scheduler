import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * AddShift component
 *
 * Props:
 *   onSuccess(shift) -> callback when shift is successfully created (receives the created shift object)
 */
export default function AddShift({ onSuccess }) {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!start || !end) {
            setError('Both start and end times are required.');
            return;
        }
        if (end <= start) {
            setError('End time must be after start time.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/shifts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ start, end }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Failed to save shift.');
            }

            const createdShift = await response.json();

            // clear form
            setStart('');
            setEnd('');

            if (onSuccess) {
                onSuccess(createdShift);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="add-shift-form" onSubmit={handleSubmit}>
            <div className="field-group">
                <label htmlFor="shift-start">Start Time</label>
                <input
                    id="shift-start"
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>
            <div className="field-group">
                <label htmlFor="shift-end">End Time</label>
                <input
                    id="shift-end"
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Add Shift'}
            </button>
        </form>
    );
}

AddShift.propTypes = {
    onSuccess: PropTypes.func,
};

AddShift.defaultProps = {
    onSuccess: null,
};