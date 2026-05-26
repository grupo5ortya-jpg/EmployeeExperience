import apiClient from './apiClient';

export const getDepartments = async () => {
    const response = await apiClient.get('/department');
    return response.data;
};

export const getDepartmentById = async (id) => {
    const response = await apiClient.get(`/department/${id}`);
    return response.data;
};
