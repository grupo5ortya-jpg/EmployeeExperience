import apiClient from './apiClient';

export const getAssignments = (surveyId) =>
    apiClient.get('/survey-assignment', { params: { surveyId } }).then((r) => r.data);

// assigned_by = employeeId until auth/roles arrive
export const createAssignment = ({ surveyId, employeeId }) =>
    apiClient.post('/survey-assignment', {
        surveyId,
        employeeId,
        assignedBy: employeeId,
        status:     'PENDING',
    }).then((r) => r.data);

export const submitResponse = (data) =>
    apiClient.post('/survey-response', data).then((r) => r.data);

export const completeAssignment = ({ surveyId, employeeId }) =>
    apiClient.patch(`/survey-assignment/${surveyId}/${employeeId}/${employeeId}`, {
        status: 'COMPLETED',
    }).then((r) => r.data);

export const getFeedbackAssignments = (cycleId) =>
    apiClient.get('/feedback-assignment', { params: { cycleId } }).then((r) => r.data);

export const completeFeedbackAssignment = (assignmentId) =>
    apiClient.patch(`/feedback-assignment/${assignmentId}`, { status: 'COMPLETED' }).then((r) => r.data);
