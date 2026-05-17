import { useCallback, useEffect, useReducer } from 'react';
import { getOnboardingTemplates } from '../services/onboardingService';

const initialState = {
    templates: [],
    loadingTemplates: true,
    templatesError: '',
};

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loadingTemplates: true, templatesError: '' };
        case 'FETCH_SUCCESS':
            return { templates: action.data, loadingTemplates: false, templatesError: '' };
        case 'FETCH_ERROR':
            return { ...state, loadingTemplates: false, templatesError: action.error };
        default:
            return state;
    }
}

const useOnboardingTemplates = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const fetchTemplates = useCallback(async () => {
        dispatch({ type: 'FETCH_START' });
        try {
            const data = await getOnboardingTemplates();
            dispatch({ type: 'FETCH_SUCCESS', data });
        } catch (error) {
            console.error(error);
            dispatch({ type: 'FETCH_ERROR', error: 'No se pudieron cargar las plantillas de onboarding' });
        }
    }, []);

    useEffect(() => { fetchTemplates(); }, []);

    return {
        templates: state.templates,
        loadingTemplates: state.loadingTemplates,
        templatesError: state.templatesError,
        refetchTemplates: fetchTemplates,
    };
};

export default useOnboardingTemplates;
