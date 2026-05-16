import apiClient from './client';

export const getEmployees = async () => {
    const response = await apiClient.get('/employees');
    return response.data;
};

export const getEmployeeById = async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
};