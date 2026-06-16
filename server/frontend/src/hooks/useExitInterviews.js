import { useQuery } from '@tanstack/react-query';
import { getPendingExitInterviews } from '../services/exitInterviewService';

export const usePendingExitInterviews = (employeeId) => {
    return useQuery({
        queryKey: ['pending-exit-interviews', employeeId],
        queryFn:  () => getPendingExitInterviews(employeeId),
        enabled:  !!employeeId,
    });
};
