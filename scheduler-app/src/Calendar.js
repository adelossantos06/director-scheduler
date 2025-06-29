// src/components/Calendar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import PropTypes from 'prop-types';
import './Calendar.css';

// Helper to generate a 6×7 grid of dates around the given month
function generateCalendarDates(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // start on the Sunday before (or of) the 1st
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    // end on the Saturday after (or of) the last
    const end = new Date(lastOfMonth);
    end.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

    const dates = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        dates.push(new Date(dt));
    }
    return dates;
}

function ScheduleItem({ entry, shift, responsibilities, onDelete }) {
    const [open, setOpen] = useState(false);
    const { director } = entry;


    return (
        <div className="schedule-item">
            {/* always-visible header */}
            <div
                className="item-header"
                onClick={() => setOpen(o => !o)}
            >
                <span><strong>{director.name}</strong></span>
                {/* <span>{shift.start}–{shift.end}</span> */}
                <button
                    onClick={e => { e.stopPropagation(); onDelete(entry._id); }}
                    className="remove-btn"
                    title="Remove"
                >
                    ✕
                </button>
            </div>

            {/* collapsible details */}
            {open && (
                <div className="item-details">
                    {responsibilities.length > 0 ? (
                        responsibilities.map(r => (
                            <div key={r._id}>
                                {r.type === 'director' ? 'Director of' : 'Utility of'}: {r.show}
                            </div>
                        ))
                    ) : (
                        <em>No responsibilities</em>
                    )}
                </div>
            )}
        </div>
    );
}

ScheduleItem.propTypes = {
    entry: PropTypes.object.isRequired,
    shift: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string
    }).isRequired,
    responsibilities: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
};

function DayCell({
    date,
    schedules,
    shifts,
    responsibilitiesByDirector,
    onScheduleCreate,
    onScheduleUpdate,
    onScheduleDelete
}) {
    const iso = date.toISOString().slice(0, 10);
    const entries = schedules.filter(s =>
        new Date(s.date).toISOString().slice(0, 10) === iso
    );

    const [, dropRef] = useDrop({
        accept: 'DIRECTOR',
        drop: ({ directorId }) => onScheduleCreate(directorId, iso),
    });

    return (
        <div ref={dropRef} className="day-cell">
            <div className="date-label">{date.getDate()}</div>

            {entries.map(entry => {
                // lookup full shift object
                const shiftId = entry.shift && (entry.shift._id || entry.shift);
                const shiftObj = shifts.find(s => s._id === shiftId) || { start: '—', end: '-' };
                console.log(shiftObj)
                // lookup responsibilities array for this director
                const dirId = entry.director._id || entry.director;
                const resps = responsibilitiesByDirector[dirId] || [];

                return (
                    <ScheduleItem
                        key={entry._id}
                        entry={entry}
                        shift={shiftObj}
                        responsibilities={resps}
                        onDelete={() => onScheduleDelete(entry._id)}
                    />
                );
            })}
        </div>
    );
}

DayCell.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    schedules: PropTypes.array.isRequired,
    shifts: PropTypes.array.isRequired,
    responsibilitiesByDirector: PropTypes.object.isRequired,
    onScheduleCreate: PropTypes.func.isRequired,
    onScheduleUpdate: PropTypes.func.isRequired,
    onScheduleDelete: PropTypes.func.isRequired,
};


export default function Calendar({
    schedules,
    shifts,
    responsibilitiesByDirector,
    onScheduleCreate,
    onScheduleUpdate,
    onScheduleDelete
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dates, setDates] = useState([]);

    const prevMonth = useCallback(() => {
        setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    }, []);
    const nextMonth = useCallback(() => {
        setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    }, []);

    useEffect(() => {
        const y = currentMonth.getFullYear();
        const m = currentMonth.getMonth();
        setDates(generateCalendarDates(y, m));
    }, [currentMonth]);

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={prevMonth}>&lt;</button>
                <h2>
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth}>&gt;</button>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="day-name">{d}</div>
                ))}

                {dates.map(date => (
                    <DayCell
                        key={date.toISOString()}
                        date={date}
                        schedules={schedules}
                        // shifts={shifts}
                        responsibilitiesByDirector={responsibilitiesByDirector}
                        onScheduleCreate={onScheduleCreate}
                        onScheduleUpdate={onScheduleUpdate}
                        onScheduleDelete={onScheduleDelete}
                    />
                ))}
            </div>
        </div>
    );
}

Calendar.propTypes = {
    schedules: PropTypes.array.isRequired,
    shifts: PropTypes.array.isRequired,
    responsibilitiesByDirector: PropTypes.object.isRequired,
    onScheduleCreate: PropTypes.func.isRequired,
    onScheduleUpdate: PropTypes.func.isRequired,
    onScheduleDelete: PropTypes.func.isRequired,
};