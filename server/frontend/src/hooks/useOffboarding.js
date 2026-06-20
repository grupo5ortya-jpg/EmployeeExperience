import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getOffboardings,
    getOffboardingByEmployee,
    startOffboarding,
    completeOffboarding,
} from '../services/offboardingService'

export const useOffboardings = (filters = {}) =>
    useQuery({
        queryKey: ['offboardings', filters],
        queryFn: () => getOffboardings(filters),
    })

export const useOffboardingByEmployee = (employeeId) =>
    useQuery({
        queryKey: ['offboardings', 'employee', employeeId],
        queryFn: () => getOffboardingByEmployee(employeeId),
        enabled: !!employeeId,
    })

const useInvalidateOffboarding = () => {
    const qc = useQueryClient()
    return () => qc.invalidateQueries({ queryKey: ['offboardings'] })
}

export const useStartOffboarding = () => {
    const invalidate = useInvalidateOffboarding()
    return useMutation({
        mutationFn: (payload) => startOffboarding(payload),
        onSuccess: invalidate,
    })
}

export const useCompleteOffboarding = () => {
    const invalidate = useInvalidateOffboarding()
    return useMutation({
        mutationFn: (employeeId) => completeOffboarding(employeeId),
        onSuccess: invalidate,
    })
}
