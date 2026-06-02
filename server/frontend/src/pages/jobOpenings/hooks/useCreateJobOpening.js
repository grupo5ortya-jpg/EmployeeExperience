import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJobOpening } from '../../../services/jobOpeningService'

export const useCreateJobOpening = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: createJobOpening,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['job-openings'] })
        },
    })
}