import apiClient from './apiClient';

export const getEmployeeTasksByTaskId = async (taskId) => {
    const response = await apiClient.get('/employee-task', { params: { taskId } });
    return response.data;
};
