import apiClient from './apiClient';

export const getQuestions = async () => {
    const response = await apiClient.get('/question');
    return response.data;
};

export const getQuestionById = async (id) => {
    const response = await apiClient.get(`/question/${id}`);
    return response.data;
};

export const createQuestion = async (data) => {
    // data: { text, type ('Abierta'|'Cerrada'), questionTypeId, estimatedDuration? }
    const response = await apiClient.post('/question', data);
    return response.data;
};

export const updateQuestion = async (id, data) => {
    const response = await apiClient.patch(`/question/${id}`, data);
    return response.data;
};

export const deleteQuestion = async (id) => {
    await apiClient.delete(`/question/${id}`);
};

export const getFeedback360Questions = (competencyIds = []) =>
    apiClient.get('/question/feedback360', {
        params: { competencies: competencyIds.join(',') },
    }).then((r) => r.data);
