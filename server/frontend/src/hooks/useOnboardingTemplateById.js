import { useEffect, useState } from 'react';
import { getOnboardingTemplateById } from '../services/onboardingApi';

const useOnboardingTemplateById = (templateId) => {
    const [template, setTemplate] = useState(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [templateError, setTemplateError] = useState('');

    useEffect(() => {
        if (!templateId) return;

        const fetchTemplate = async () => {
            try {
                setLoadingTemplate(true);
                setTemplateError('');

                const data = await getOnboardingTemplateById(templateId);
                setTemplate(data);
            } catch (error) {
                console.error(error);
                setTemplateError('No se pudo cargar el detalle de la plantilla');
            } finally {
                setLoadingTemplate(false);
            }
        };

        fetchTemplate();
    }, [templateId]);

    return {
        template,
        loadingTemplate,
        templateError,
    };
};

export default useOnboardingTemplateById;