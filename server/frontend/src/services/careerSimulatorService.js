import apiClient from './apiClient';

export const generateCareerPlan = ({ employeeId, jobOpeningId }) =>
    apiClient.post('/career-simulator', { employeeId, jobOpeningId }).then((r) => r.data);

export const getActivePlan = (employeeId) =>
    apiClient.get(`/career-simulator/${employeeId}/active`).then((r) => r.data);

export const getPlanHistory = (employeeId) =>
    apiClient.get(`/career-simulator/${employeeId}`).then((r) => r.data);
