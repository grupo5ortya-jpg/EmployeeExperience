import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} from '../services/questionService';
import apiClient from '../services/apiClient';

const useInvalidateQuestions = () => {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ['questions'] });
};

export const useQuestions = () =>
    useQuery({ queryKey: ['questions'], queryFn: getQuestions });

export const useCreateQuestion = () => {
    const invalidate = useInvalidateQuestions();
    return useMutation({
        mutationFn: (data) => createQuestion(data),
        onSuccess: invalidate,
    });
};

export const useUpdateQuestion = () => {
    const invalidate = useInvalidateQuestions();
    return useMutation({
        mutationFn: ({ id, data }) => updateQuestion(id, data),
        onSuccess: invalidate,
    });
};

export const useDeleteQuestion = () => {
    const invalidate = useInvalidateQuestions();
    return useMutation({
        mutationFn: (id) => deleteQuestion(id),
        onSuccess: invalidate,
    });
};

// Option mutations (for Cerrada questions)
export const useCreateQuestionOption = () => {
    const invalidate = useInvalidateQuestions();
    return useMutation({
        mutationFn: (data) => apiClient.post('/question-option', data).then((r) => r.data),
        onSuccess: invalidate,
    });
};

export const useDeleteQuestionOption = () => {
    const invalidate = useInvalidateQuestions();
    return useMutation({
        mutationFn: (id) => apiClient.delete(`/question-option/${id}`),
        onSuccess: invalidate,
    });
};
