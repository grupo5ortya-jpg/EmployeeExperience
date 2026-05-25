import { useQuery } from '@tanstack/react-query';
import { getAllEmployeeTasks } from '../services/employeeTaskService';

export const useAllEmployeeTasks = () => {
    return useQuery({
        queryKey: ['employee-tasks', 'all'],
        queryFn: getAllEmployeeTasks,
    });
};
