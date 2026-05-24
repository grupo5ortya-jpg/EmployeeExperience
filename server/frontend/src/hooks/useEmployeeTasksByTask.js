import { useQuery } from '@tanstack/react-query';
import { getEmployeeTasksByTaskId } from '../services/employeeTaskService';

export const useEmployeeTasksByTask = (taskId) => {
    return useQuery({
        queryKey: ['employee-tasks', 'by-task', taskId],
        queryFn: () => getEmployeeTasksByTaskId(taskId),
        enabled: !!taskId,
    });
};
