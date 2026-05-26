import { useQuery } from '@tanstack/react-query';
import { getQuestionTypes } from '../services/questionTypeService';

export const useQuestionTypes = () => {
    return useQuery({
        queryKey: ['question-types'],
        queryFn:  getQuestionTypes,
    });
};
