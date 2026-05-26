import { useQuery } from '@tanstack/react-query';
import { getAllSurveyAssignments } from '../services/surveyAssignmentService';

/**
 * Devuelve todas las asignaciones de encuesta.
 * Para filtrar por surveyId podés hacerlo en el componente:
 *   const bySurvey = assignments.filter(a => a.surveyId === id)
 */
export const useSurveyAssignments = () => {
    return useQuery({
        queryKey: ['survey-assignments'],
        queryFn:  getAllSurveyAssignments,
    });
};
