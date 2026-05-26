import apiClient from './apiClient';

export const getQuestionTypes = async () => {
    const response = await apiClient.get('/question-type');
    return response.data;
};

export const getQuestionTypeById = async (id) => {
    const response = await apiClient.get(`/question-type/${id}`);
    return response.data;
};

export const createQuestionType = async (data) => {
    const response = await apiClient.post('/question-type', data);
    return response.data;
};

export const updateQuestionType = async (id, data) => {
    const response = await apiClient.patch(`/question-type/${id}`, data);
    return response.data;
};

export const deleteQuestionType = async (id) => {
    await apiClient.delete(`/question-type/${id}`);
};
