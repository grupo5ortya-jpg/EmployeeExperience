import { useQuery } from '@tanstack/react-query';
import { getTaskTypes } from '../services/taskTypeService';

export const useTaskTypes = () => {
    return useQuery({
        queryKey: ['tasksTypes'],
        queryFn: getTaskTypes,
    });
};
