import { useMutation } from '@tanstack/react-query';
import { getMentorSuggestions } from '../services/aiService';

//usemutation por accion de ia No trayendo lista fija.
export const useMentorSuggestions = () => {
    return useMutation({
        mutationFn: getMentorSuggestions,
    });
};