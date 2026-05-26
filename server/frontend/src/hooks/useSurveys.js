import { useQuery } from '@tanstack/react-query';
import { getSurveys } from '../services/surveyService';

export const useSurveys = () => {
    return useQuery({
        queryKey: ['surveys'],
        queryFn:  getSurveys,
    });
};
