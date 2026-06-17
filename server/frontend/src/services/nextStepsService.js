import apiClient from './apiClient';

export const getNextSteps = (employeeId) =>
    apiClient.get('/next-steps', { params: { employeeId } }).then((r) => r.data);
