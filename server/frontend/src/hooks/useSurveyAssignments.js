import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignments, createAssignment } from '../services/feedback360Service';

export function useSurveyAssignments(surveyId) {
    return useQuery({
        queryKey: ['survey-assignments', surveyId],
        queryFn:  () => getAssignments(surveyId),
        enabled:  !!surveyId,
    });
}

export function useCreateAssignment(surveyId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createAssignment,
        onSuccess:  () => qc.invalidateQueries({ queryKey: ['survey-assignments', surveyId] }),
    });
}
