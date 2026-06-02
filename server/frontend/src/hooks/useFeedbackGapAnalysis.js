import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGapAnalysis, generateGapAnalysis } from '../services/feedback360Service';

export function useFeedbackGapAnalysis(cycleId, evaluatedId) {
    return useQuery({
        queryKey: ['feedback-gap-analysis', cycleId, evaluatedId],
        queryFn:  () => getGapAnalysis(cycleId, evaluatedId),
        enabled:  !!cycleId && !!evaluatedId,
    });
}

export function useGenerateGapAnalysis(cycleId, evaluatedId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => generateGapAnalysis(cycleId, evaluatedId),
        onSuccess:  (data) => {
            qc.setQueryData(['feedback-gap-analysis', cycleId, evaluatedId], data);
        },
    });
}
