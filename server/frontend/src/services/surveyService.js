import apiClient from './apiClient';

export const getSurveys = async () => {
    const response = await apiClient.get('/survey');
    return response.data;
};

export const getSurveyById = async (id) => {
    const response = await apiClient.get(`/survey/${id}`);
    return response.data;
};

export const createSurvey = async (data) => {
    // data: { name, surveyTypeId, questionTypeId? }
    const response = await apiClient.post('/survey', data);
    return response.data;
};

export const updateSurvey = async (id, data) => {
    const response = await apiClient.patch(`/survey/${id}`, data);
    return response.data;
};

export const deleteSurvey = async (id) => {
    await apiClient.delete(`/survey/${id}`);
};
