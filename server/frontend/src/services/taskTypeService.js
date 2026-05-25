import apiClient from './apiClient';

export const getTaskTypes = async () => {
    const response = await apiClient.get('/task-type');
    return response.data;
};

export const createTaskType = async (data) => {
    const response = await apiClient.post('/task-type', data);
    return response.data;
};
