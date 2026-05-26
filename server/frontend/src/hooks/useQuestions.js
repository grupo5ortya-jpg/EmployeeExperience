import { useQuery } from '@tanstack/react-query';
import { getQuestions } from '../services/questionService';

export const useQuestions = () => {
    return useQuery({
        queryKey: ['questions'],
        queryFn:  getQuestions,
    });
};
