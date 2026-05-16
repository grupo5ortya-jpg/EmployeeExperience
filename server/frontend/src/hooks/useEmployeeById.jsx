import { useQuery } from '@tanstack/react-query';
import { getEmployeeById } from '../services/employeeService';

export const useEmployeeById = (id) => {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: () => getEmployeeById(id),
    });
};