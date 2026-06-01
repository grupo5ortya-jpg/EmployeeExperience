import { useQuery } from '@tanstack/react-query';
import { getJobOpenings } from '../../../services/jobOpeningService';

export const useJobOpenings = () =>
    useQuery({
        queryKey: ['job-openings'],
        queryFn: getJobOpenings,
    })