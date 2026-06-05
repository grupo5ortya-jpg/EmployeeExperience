import { useQuery } from '@tanstack/react-query';
import { getMyFeedbackAssignments } from '../services/feedback360Service';

export function useMyFeedbackAssignments(evaluatorId) {
    return useQuery({
        queryKey: ['my-feedback-assignments', evaluatorId],
        queryFn:  () => getMyFeedbackAssignments(evaluatorId),
        enabled:  !!evaluatorId,
    });
}
