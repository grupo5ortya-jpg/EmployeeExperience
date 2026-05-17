import apiClient from './apiClient';

export const getOnboardingTemplates = async () => {
    const response = await apiClient.get('/onboarding-templates');
    return response.data;
};

export const getOnboardingTemplateById = async (id) => {
    const response = await apiClient.get(`/onboarding-templates/${id}`);
    return response.data;
};

export const createOnboardingTemplate = async (payload) => {
    const response = await apiClient.post('/onboarding-templates', payload);
    return response.data;
};

export const createOnboardingTemplateTask = async (payload) => {
    const response = await apiClient.post('/onboarding-template-tasks', payload);
    return response.data;
};