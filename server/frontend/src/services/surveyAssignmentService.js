import apiClient from './apiClient';

export const getAllSurveyAssignments = async () => {
    const response = await apiClient.get('/survey-assignment');
    return response.data;
};

export const createSurveyAssignment = async (data) => {
    // data: { surveyId, employeeId, assignedBy?, dueDate?, status? }
    const response = await apiClient.post('/survey-assignment', data);
    return response.data;
};

export const updateSurveyAssignment = async ({ surveyId, employeeId, assignedBy = 'null' }, data) => {
    const response = await apiClient.patch(
        `/survey-assignment/${surveyId}/${employeeId}/${assignedBy}`,
        data,
    );
    return response.data;
};

export const deleteSurveyAssignment = async ({ surveyId, employeeId, assignedBy = 'null' }) => {
    await apiClient.delete(
        `/survey-assignment/${surveyId}/${employeeId}/${assignedBy}`,
    );
};
