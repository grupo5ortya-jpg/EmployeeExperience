import apiClient from './apiClient';

export const getEmployees = async () => {
    const response = await apiClient.get('/employees');
    return response.data;
};

export const getEmployeeById = async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
};

export const createEmployee = async (data) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
};