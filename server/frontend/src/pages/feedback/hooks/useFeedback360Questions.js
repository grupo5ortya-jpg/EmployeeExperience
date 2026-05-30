import { useQuery } from '@tanstack/react-query';
import { getFeedback360Questions } from '../../../services/questionService';

export function useFeedback360Questions(competencyIds = []) {
    return useQuery({
        queryKey:  ['feedback360-questions', [...competencyIds].sort()],
        queryFn:   () => getFeedback360Questions(competencyIds),
        enabled:   competencyIds.length > 0,
        staleTime: Infinity,
    });
}
