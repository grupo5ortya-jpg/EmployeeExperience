import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getEnrollments,
    enrollInCourse,
    updateEnrollmentProgress,
    requestCompletion,
    reviewCompletion,
} from '../services/learningService'

export const useCourses = () =>
    useQuery({
        queryKey: ['learning-courses'],
        queryFn: getCourses,
    })

export const useEnrollments = (filters = {}) =>
    useQuery({
        queryKey: ['course-enrollments', filters],
        queryFn: () => getEnrollments(filters),
    })

const useInvalidateLearning = () => {
    const qc = useQueryClient()
    return () => {
        qc.invalidateQueries({ queryKey: ['course-enrollments'] })
        qc.invalidateQueries({ queryKey: ['learning-courses'] })
    }
}

export const useCreateCourse = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: (payload) => createCourse(payload),
        onSuccess: invalidate,
    })
}

export const useUpdateCourse = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: ({ id, payload }) => updateCourse(id, payload),
        onSuccess: invalidate,
    })
}

export const useDeleteCourse = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: (id) => deleteCourse(id),
        onSuccess: invalidate,
    })
}

export const useEnrollInCourse = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: ({ employeeId, courseId }) => enrollInCourse({ employeeId, courseId }),
        onSuccess: invalidate,
    })
}

export const useUpdateProgress = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: ({ id, progress }) => updateEnrollmentProgress(id, progress),
        onSuccess: invalidate,
    })
}

export const useRequestCompletion = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: (id) => requestCompletion(id),
        onSuccess: invalidate,
    })
}

export const useReviewCompletion = () => {
    const invalidate = useInvalidateLearning()
    return useMutation({
        mutationFn: ({ id, decision, certificateLink }) => reviewCompletion(id, { decision, certificateLink }),
        onSuccess: invalidate,
    })
}
