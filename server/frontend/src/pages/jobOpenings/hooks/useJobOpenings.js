import { useQuery } from '@tanstack/react-query';
import { getJobOpenings } from '../../../services/jobOpeningService';

export const useJobOpenings = () => {
    return useQuery({
        queryKey: ['jobOpenings'],
        queryFn: getJobOpenings,
    });
};