import { useQuery } from '@tanstack/react-query'
import { getContinuousFeedback } from '../../../services/continuousFeedbackService'

export const useContinuousFeedback = () => {
    return useQuery({
        queryKey: ['continuous-feedback'],
        queryFn: getContinuousFeedback,
    })
}