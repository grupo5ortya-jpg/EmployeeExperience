import { useQuery } from '@tanstack/react-query'
import { getContinuousFeedback, getReceivedFeedbacks, getSentFeedbacks } from '../../../services/continuousFeedbackService'

export const useContinuousFeedback = () => {
    return useQuery({
        queryKey: ['continuous-feedback'],
        queryFn:  getContinuousFeedback,
    })
}

export const useReceivedFeedbacks = (employeeId) => {
    return useQuery({
        queryKey: ['continuous-feedback', 'received', employeeId],
        queryFn:  () => getReceivedFeedbacks(employeeId),
        enabled:  !!employeeId,
    })
}

export const useSentFeedbacks = (employeeId) => {
    return useQuery({
        queryKey: ['continuous-feedback', 'sent', employeeId],
        queryFn:  () => getSentFeedbacks(employeeId),
        enabled:  !!employeeId,
    })
}