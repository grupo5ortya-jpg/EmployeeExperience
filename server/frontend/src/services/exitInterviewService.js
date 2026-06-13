import apiClient from './apiClient';

export const getPendingExitInterviews = async (employeeId) => {
    const response = await apiClient.get(`/exit-interviews/pending?employeeId=${employeeId}`);
    return response.data;
};

export const submitExitInterview = async ({ surveyId, employeeId, responses }) => {
    const response = await apiClient.post(`/exit-interviews/${surveyId}/submit`, { employeeId, responses });
    return response.data;
};
