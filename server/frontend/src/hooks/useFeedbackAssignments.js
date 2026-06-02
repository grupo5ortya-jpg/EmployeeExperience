import { useQuery } from '@tanstack/react-query';
import { getFeedbackAssignments } from '../services/feedback360Service';

export function useFeedbackAssignments(cycleId) {
    return useQuery({
        queryKey: ['feedback-assignments', cycleId],
        queryFn:  () => getFeedbackAssignments(cycleId),
        enabled:  !!cycleId,
    });
}
