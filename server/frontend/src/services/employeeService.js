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
    console.log('VER DEPARTMENT ID', data)
    const response = await apiClient.post('/employees', data);
    return response.data;
};

export const updateEmployee = async (id, data) => {
    const response = await apiClient.patch(`/employees/${id}`, data);
    return response.data;
};

export const assignLeader = async (employeeId, leaderId) => {
    const response = await apiClient.patch(`/employees/${employeeId}/leader`, { leaderId: leaderId || null });
    return response.data;
};

export const assignMentor = async (employeeId, mentorId) => {
    const response = await apiClient.patch(`/employees/${employeeId}/mentor`, { mentorId });
    return response.data;
};