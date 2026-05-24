import { useQuery } from '@tanstack/react-query';
import { getRoles } from '../services/roleService';

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: getRoles,
    });
};
