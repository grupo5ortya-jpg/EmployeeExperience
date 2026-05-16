import { useEffect, useState } from 'react';
import { getEmployees } from '../../api/employeeApi'

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployees();
                setEmployees(data);
            } catch (err) {
                setError('No se pudieron cargar los empleados');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    if (loading) return <p>Cargando empleados...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Empleados</h2>
            {employees.map((employee) => (
                <div key={employee.id}>
                    <Link to={`/detailEmpleado/${employee.id}`}>
                        {employee.fullName}
                    </Link>
                    <p>{employee.position}</p>
                    <p>{employee.department?.name}</p>
                </div>
            ))}
        </div>
    );
}

export default EmployeeList;