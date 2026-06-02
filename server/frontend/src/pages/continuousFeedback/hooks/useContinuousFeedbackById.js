import { useQuery } from '@tanstack/react-query'
import { getContinuousFeedbackById } from '../../../services/continuousFeedbackService'

export const useContinuousFeedbackById = (id) => {
    return useQuery({
        queryKey: ['continuous-feedback', id],
        queryFn: () => getContinuousFeedbackById(id),
        enabled: !!id,
    })
}