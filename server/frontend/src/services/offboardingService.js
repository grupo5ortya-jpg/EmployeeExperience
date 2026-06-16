import apiClient from './apiClient';

export const getOffboardings = ({ status } = {}) =>
    apiClient.get('/offboarding', {
        params: { ...(status ? { status } : {}) },
    }).then((r) => r.data);

export const getOffboardingByEmployee = (employeeId) =>
    apiClient.get(`/offboarding/${employeeId}`).then((r) => r.data);

export const startOffboarding = ({ employeeId, lastWorkingDay, rehirable }) =>
    apiClient.post('/offboarding', { employeeId, lastWorkingDay, rehirable }).then((r) => r.data);

export const completeOffboarding = (employeeId) =>
    apiClient.patch(`/offboarding/${employeeId}/complete`).then((r) => r.data);
