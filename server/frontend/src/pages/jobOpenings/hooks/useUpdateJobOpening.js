import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJobOpening } from '../../../services/jobOpeningService'

export const useUpdateJobOpening = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: ({ id, payload }) =>
            updateJobOpening(id, payload),

        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['job-openings'] })
            qc.invalidateQueries({
                queryKey: ['job-opening', variables.id],
            })
        },
    })
}