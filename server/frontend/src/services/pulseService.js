import apiClient from './apiClient';

export const getPendingPulseSurveys = async (employeeId) => {
    const response = await apiClient.get(`/pulse-surveys/pending?employeeId=${employeeId}`);
    return response.data;
};

export const submitPulseResponse = async (data) => {
    const response = await apiClient.post('/survey-response', data);
    return response.data;
};

export const completePulseAssignment = async ({ surveyId, employeeId, assignedBy }) => {
    const response = await apiClient.patch(
        `/survey-assignment/${surveyId}/${employeeId}/${assignedBy ?? 'null'}`,
        { status: 'COMPLETED' },
    );
    return response.data;
};
