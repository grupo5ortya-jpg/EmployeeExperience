import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContinuousFeedback } from '../../../services/continuousFeedbackService'
export const useCreateContinuousFeedback = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createContinuousFeedback,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['continuous-feedback'],
            })
        },
    })
}