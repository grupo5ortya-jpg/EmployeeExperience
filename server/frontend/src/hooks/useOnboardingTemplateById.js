import { useQuery } from '@tanstack/react-query';
import { getOnboardingTemplateById } from '../../services/onboardingService';

const useOnboardingTemplateById = (templateId) => {

    return useQuery({
        queryKey: ['onboarding-template', templateId],

        queryFn: () =>
            getOnboardingTemplateById(templateId),

        enabled: !!templateId,
    });
};

export default useOnboardingTemplateById;