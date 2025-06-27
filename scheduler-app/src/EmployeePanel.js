import React, { useEffect, useState } from "react";
import EmployeeCard from "./EmployeeCard";
import AddDirector from "./AddDirector";

function EmployeePanel() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/names')
            .then(res => res.json())
            .then(data => setEmployees(data))
            .catch(err => console.error('Failed to fetch names', err));
    }, []);

    const handleAdded = () => {
        fetch('http://localhost:8000/api/names')
            .then(res => res.json())
            .then(data => setEmployees(data))
            .catch(err => console.error('Failed to refresh names', err));
    };

    return (
        <section className="employee-section">
            <h2>Directors</h2>

            <AddDirector onSuccess={handleAdded} />

            <div className="employee-list">
                {employees.map(emp => (
                    <EmployeeCard key={emp._id} name={emp.name} />
                ))}
            </div>
        </section>
    )
} 
