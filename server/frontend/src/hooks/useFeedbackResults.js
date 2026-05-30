import { useQuery } from '@tanstack/react-query';
import { getFeedbackResults } from '../services/feedback360Service';

export function useFeedbackResults(cycleId, evaluatedId) {
    return useQuery({
        queryKey: ['feedback-results', cycleId, evaluatedId],
        queryFn:  () => getFeedbackResults(cycleId, evaluatedId),
        enabled:  !!cycleId && !!evaluatedId,
    });
}
