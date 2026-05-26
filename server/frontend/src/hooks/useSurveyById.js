import { useQuery } from '@tanstack/react-query';
import { getSurveyById } from '../services/surveyService';

export const useSurveyById = (id) => {
    return useQuery({
        queryKey: ['surveys', id],
        queryFn:  () => getSurveyById(id),
        enabled:  !!id,
    });
};
