import { useCallback, useEffect, useReducer } from 'react';
import { getOnboardingTemplateById } from '../services/onboardingService';

const initialState = {
    template: null,
    loadingTemplate: false,
    templateError: '',
};

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loadingTemplate: true, templateError: '' };
        case 'FETCH_SUCCESS':
            return { template: action.data, loadingTemplate: false, templateError: '' };
        case 'FETCH_ERROR':
            return { ...state, loadingTemplate: false, templateError: action.error };
        default:
            return state;
    }
}

const useOnboardingTemplateById = (templateId) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const fetchTemplate = useCallback(async () => {
        if (!templateId) return;
        dispatch({ type: 'FETCH_START' });
        try {
            const data = await getOnboardingTemplateById(templateId);
            dispatch({ type: 'FETCH_SUCCESS', data });
        } catch (error) {
            console.error(error);
            dispatch({ type: 'FETCH_ERROR', error: 'No se pudo cargar el detalle de la plantilla' });
        }
    }, [templateId]);

    useEffect(() => { fetchTemplate(); }, [fetchTemplate]);

    return {
        template: state.template,
        loadingTemplate: state.loadingTemplate,
        templateError: state.templateError,
        refetchTemplate: fetchTemplate,
    };
};

export default useOnboardingTemplateById;
