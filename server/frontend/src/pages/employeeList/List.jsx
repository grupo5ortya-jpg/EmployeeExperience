import { Link } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';


function EmployeeList() {

    const {
        data: employees,
        isLoading,
        error
    } = useEmployees();

    if (isLoading) {
        return <p>Cargando empleados...</p>;
    }

    if (error) {
        return <p>No se pudieron cargar los empleados</p>;
    }

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