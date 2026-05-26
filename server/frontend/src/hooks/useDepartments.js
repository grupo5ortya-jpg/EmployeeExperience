import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '../services/departmentService';

export const useDepartments = () => {
    return useQuery({
        queryKey: ['departments'],
        queryFn:  getDepartments,
    });
};
