import apiClient from './apiClient';

export const getTasks = async () => {
    const response = await apiClient.get('/task');
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await apiClient.get(`/task/${id}`);
    return response.data;
};

export const updateTask = async (id, data) => {
    const response = await apiClient.patch(`/task/${id}`, data);
    return response.data;
};
