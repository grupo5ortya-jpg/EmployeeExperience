import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAlumni, getAlumniByEmployee, updateAlumni, rehireAlumni } from '../services/alumniService'

export const useAlumni = (filters = {}) =>
    useQuery({
        queryKey: ['alumni', filters],
        queryFn: () => getAlumni(filters),
    })

export const useAlumniByEmployee = (employeeId) =>
    useQuery({
        queryKey: ['alumni', 'employee', employeeId],
        queryFn: () => getAlumniByEmployee(employeeId),
        enabled: !!employeeId,
    })

export const useUpdateAlumni = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ employeeId, ...payload }) => updateAlumni(employeeId, payload),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: ['alumni'] })
            queryClient.invalidateQueries({ queryKey: ['alumni', 'employee', employeeId] })
        },
    })
}

export const useRehireAlumni = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (employeeId) => rehireAlumni(employeeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alumni'] })
        },
    })
}
