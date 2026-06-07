import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getOkrs,
    getMyOkrs,
    getOkrById,
    createOkr,
    updateOkr,
    updateOkrProgress,
} from '../services/okrService'

export const useOkrs = (filters = {}) => {
    return useQuery({
        queryKey: ['okr', 'all', filters],
        queryFn:  () => getOkrs(filters),
    })
}

export const useMyOkrs = (employeeId) => {
    return useQuery({
        queryKey: ['okr', 'mine', employeeId],
        queryFn:  () => getMyOkrs(employeeId),
        enabled:  !!employeeId,
    })
}

export const useOkrById = (id) => {
    return useQuery({
        queryKey: ['okr', 'detail', id],
        queryFn:  () => getOkrById(id),
        enabled:  !!id,
    })
}

export const useCreateOkr = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createOkr,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['okr'] })
        },
    })
}

export const useUpdateOkr = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateOkr,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['okr'] })
        },
    })
}

export const useUpdateOkrProgress = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateOkrProgress,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['okr'] })
        },
    })
}
