import { useCallback, useEffect, useState } from 'react';
import { getOnboardingTemplates } from '../services/onboardingService';

const useOnboardingTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesError, setTemplatesError] = useState('');

    const fetchTemplates = useCallback(async () => {
        try {
            setLoadingTemplates(true);
            setTemplatesError('');

            const data = await getOnboardingTemplates();
            setTemplates(data);
        } catch (error) {
            console.error(error);
            setTemplatesError('No se pudieron cargar las plantillas de onboarding');
        } finally {
            setLoadingTemplates(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        templates,
        loadingTemplates,
        templatesError,
        refetchTemplates: fetchTemplates,
    };
};

export default useOnboardingTemplates;