import { useEffect, useState } from 'react';
import { getOnboardingTemplates } from '../services/onboardingApi';


const useOnboardingTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesError, setTemplatesError] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await getOnboardingTemplates();
                setTemplates(data);
            } catch (error) {
                console.error(error);
                setTemplatesError('No se pudieron cargar las plantillas de onboarding');
            } finally {
                setLoadingTemplates(false);
            }
        };

        fetchTemplates();
    }, []);

    return {
        templates,
        loadingTemplates,
        templatesError,
    };
};

export default useOnboardingTemplates;