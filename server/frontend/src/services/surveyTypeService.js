import apiClient from './apiClient';

export const getSurveyTypes = async () => {
    const response = await apiClient.get('/survey-type');
    return response.data;
};

export const getSurveyTypeById = async (id) => {
    const response = await apiClient.get(`/survey-type/${id}`);
    return response.data;
};

export const createSurveyType = async (data) => {
    const response = await apiClient.post('/survey-type', data);
    return response.data;
};

export const updateSurveyType = async (id, data) => {
    const response = await apiClient.patch(`/survey-type/${id}`, data);
    return response.data;
};

export const deleteSurveyType = async (id) => {
    await apiClient.delete(`/survey-type/${id}`);
};
