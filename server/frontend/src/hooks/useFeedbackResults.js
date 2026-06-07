import { useQuery } from '@tanstack/react-query';
import { getFeedbackResults, getCycleSummary } from '../services/feedback360Service';

export function useFeedbackResults(cycleId, evaluatedId) {
    return useQuery({
        queryKey: ['feedback-results', cycleId, evaluatedId],
        queryFn:  () => getFeedbackResults(cycleId, evaluatedId),
        enabled:  !!cycleId && !!evaluatedId,
    });
}

export function useCycleSummary(cycleId) {
    return useQuery({
        queryKey: ['cycle-summary', cycleId],
        queryFn:  () => getCycleSummary(cycleId),
        enabled:  !!cycleId,
    });
}
