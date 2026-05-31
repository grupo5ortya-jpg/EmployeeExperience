import { useQuery } from '@tanstack/react-query';
import { getSkills } from '../../../services/skillService';

export const useSkills = () => {
    return useQuery({
        queryKey: ['skills'],
        queryFn: getSkills,
    });
};