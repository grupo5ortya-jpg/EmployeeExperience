import { useQuery } from '@tanstack/react-query';
import { getTaskById } from '../services/taskService';

export const useTaskById = (id) => {
    return useQuery({
        queryKey: ['task', id],
        queryFn: () => getTaskById(id),
        enabled: !!id,
    });
};
