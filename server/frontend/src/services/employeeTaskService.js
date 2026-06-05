import apiClient from './apiClient';

export const getAllEmployeeTasks = () =>
    apiClient.get('/employee-task').then((r) => r.data);

export const getEmployeeTasksByTaskId = (taskId) =>
    apiClient.get('/employee-task', { params: { taskId } }).then((r) => r.data);

export const getMyTasks = (employeeId) =>
    apiClient.get('/employee-task', { params: { employeeId } }).then((r) => r.data);

export const createEmployeeTask = (data) =>
    apiClient.post('/employee-task', data).then((r) => r.data);

export const updateTaskStatus = (employeeId, taskId, status) =>
    apiClient.patch(`/employee-task/${employeeId}/${taskId}`, { status }).then((r) => r.data);

export const deleteEmployeeTask = (employeeId, taskId) =>
    apiClient.delete(`/employee-task/${employeeId}/${taskId}`).then((r) => r.data);
