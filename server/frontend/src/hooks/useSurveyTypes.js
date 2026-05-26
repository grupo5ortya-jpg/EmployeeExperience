import { useQuery } from '@tanstack/react-query';
import { getSurveyTypes } from '../services/surveyTypeService';

export const useSurveyTypes = () => {
    return useQuery({
        queryKey: ['survey-types'],
        queryFn:  getSurveyTypes,
    });
};
