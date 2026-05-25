import apiClient from './apiClient';

export const getAllEmployeeTasks = async () => {
    const response = await apiClient.get('/employee-task');
    return response.data;
};

export const getEmployeeTasksByTaskId = async (taskId) => {
    const response = await apiClient.get('/employee-task', { params: { taskId } });
    return response.data;
};

export const createEmployeeTask = async (data) => {
    const response = await apiClient.post('/employee-task', data);
    return response.data;
};
