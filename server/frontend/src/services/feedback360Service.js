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

export const getMyFeedbackAssignments = (evaluatorId) =>
    apiClient.get('/feedback-assignment', { params: { evaluatorId } }).then((r) => r.data);

export const getMyResultCycles = (evaluatedId) =>
    apiClient.get('/feedback-assignment', { params: { evaluatedId, status: 'COMPLETED' } })
        .then((r) => r.data);

export const completeFeedbackAssignment = (assignmentId, comments = {}, scores = {}) =>
    apiClient.patch(`/feedback-assignment/${assignmentId}`, {
        status: 'COMPLETED',
        comments,
        scores,
    }).then((r) => r.data);

export const getFeedbackResults = (cycleId, evaluatedId) =>
    apiClient.get('/feedback-assignment/results', { params: { cycleId, evaluatedId } })
        .then((r) => r.data);

export const getGapAnalysis = (cycleId, evaluatedId) =>
    apiClient.get('/feedback-assignment/gap-analysis', { params: { cycleId, evaluatedId } })
        .then((r) => r.data).catch(() => null);

export const generateGapAnalysis = (cycleId, evaluatedId) =>
    apiClient.post('/feedback-assignment/gap-analysis', { cycleId, evaluatedId })
        .then((r) => r.data);
