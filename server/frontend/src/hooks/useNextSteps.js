import { useQuery } from '@tanstack/react-query'
import { getNextSteps } from '../services/nextStepsService'

export const useNextSteps = (employeeId) =>
    useQuery({
        queryKey: ['next-steps', employeeId],
        queryFn: () => getNextSteps(employeeId),
        enabled: !!employeeId,
        staleTime: 60_000, // 1 min — no necesita refrescar en cada render
    })
