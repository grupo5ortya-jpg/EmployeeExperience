import { useQuery } from '@tanstack/react-query';
import { getPendingPulseSurveys } from '../services/pulseService';

export const usePendingSurveys = (employeeId) => {
    return useQuery({
        queryKey: ['pending-pulse-surveys', employeeId],
        queryFn:  () => getPendingPulseSurveys(employeeId),
        enabled:  !!employeeId,
    });
};
