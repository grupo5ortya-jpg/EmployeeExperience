import { useMutation } from '@tanstack/react-query'
import { applyToJobOpening } from '../../../services/jobOpeningService'

export const useApplyToJobOpening = () => {
    return useMutation({
        mutationFn: ({ id, employeeId }) => applyToJobOpening(id, employeeId),
    })
}
