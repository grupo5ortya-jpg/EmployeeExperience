import apiClient from './apiClient';

export const getOnboardingTemplates = async () => {
    const response = await apiClient.get('/onboarding-templates');
    return response.data;
};

export const getOnboardingTemplateById = async (id) => {
    const response = await apiClient.get(`/onboarding-templates/${id}`);
    return response.data;
};