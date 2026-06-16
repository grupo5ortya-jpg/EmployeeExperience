import apiClient from './apiClient';

export const getAlumni = ({ search, skillId, rehirable } = {}) =>
    apiClient.get('/alumni', { params: { search, skillId, rehirable } }).then((r) => r.data);

export const getAlumniByEmployee = (employeeId) =>
    apiClient.get(`/alumni/${employeeId}`).then((r) => r.data);

export const updateAlumni = (employeeId, payload) =>
    apiClient.patch(`/alumni/${employeeId}`, payload).then((r) => r.data);

export const rehireAlumni = (employeeId) =>
    apiClient.patch(`/alumni/${employeeId}/rehire`).then((r) => r.data);
