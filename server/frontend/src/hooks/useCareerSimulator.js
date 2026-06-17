import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateCareerPlan, getActivePlan, getPlanHistory } from '../services/careerSimulatorService'

export const useActivePlan = (employeeId) =>
    useQuery({
        queryKey: ['career-plans', 'active', employeeId],
        queryFn: async () => {
            try {
                return await getActivePlan(employeeId)
            } catch (err) {
                if (err.response?.status === 404) return null
                throw err
            }
        },
        enabled: !!employeeId,
        retry: false,
    })

export const usePlanHistory = (employeeId) =>
    useQuery({
        queryKey: ['career-plans', 'history', employeeId],
        queryFn: () => getPlanHistory(employeeId),
        enabled: !!employeeId,
    })

export const useGeneratePlan = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: generateCareerPlan,
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: ['career-plans', 'active', employeeId] })
            queryClient.invalidateQueries({ queryKey: ['career-plans', 'history', employeeId] })
        },
    })
}
