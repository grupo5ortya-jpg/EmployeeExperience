import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeById } from '../../services/employeeService';

function EmployeeDetail() {
    const { id } = useParams();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const data = await getEmployeeById(id);
                setEmployee(data);
            } catch (err) {
                setError('No se pudo cargar el empleado');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEmployee();
        }
    }, [id]);

    if (loading) return <p>Cargando empleado...</p>;
    if (error) return <p>{error}</p>;
    if (!employee) return <p>No se encontró el empleado</p>;

    return (
        <div>
            <h2>{employee.fullName}</h2>
            <p>{employee.position}</p>
            <p>{employee.department?.name}</p>
            <p>{employee.user?.email}</p>
        </div>
    );
}

export default EmployeeDetail;