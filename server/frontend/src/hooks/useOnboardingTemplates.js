import { useQuery } from '@tanstack/react-query';
import { getOnboardingTemplates } from '../services/onboardingService';

const useOnboardingTemplates = () => {

    return useQuery({
        queryKey: ['onboarding-templates'],
        queryFn: getOnboardingTemplates,
    });
};

export default useOnboardingTemplates;