import apiClient from './apiClient';

export const getCourses = () =>
    apiClient.get('/learning-courses').then((r) => r.data);

export const getCourseById = (id) =>
    apiClient.get(`/learning-courses/${id}`).then((r) => r.data);

export const createCourse = (payload) =>
    apiClient.post('/learning-courses', payload).then((r) => r.data);

export const updateCourse = (id, payload) =>
    apiClient.patch(`/learning-courses/${id}`, payload).then((r) => r.data);

export const deleteCourse = (id) =>
    apiClient.delete(`/learning-courses/${id}`).then((r) => r.data);

export const getEnrollments = ({ employeeId, courseId, status } = {}) =>
    apiClient.get('/course-enrollments', {
        params: {
            ...(employeeId ? { employeeId } : {}),
            ...(courseId ? { courseId } : {}),
            ...(status ? { status } : {}),
        },
    }).then((r) => r.data);

export const enrollInCourse = ({ employeeId, courseId }) =>
    apiClient.post('/course-enrollments', { employeeId, courseId }).then((r) => r.data);

export const updateEnrollmentProgress = (id, progress) =>
    apiClient.patch(`/course-enrollments/${id}/progress`, { progress }).then((r) => r.data);

export const requestCompletion = (id) =>
    apiClient.patch(`/course-enrollments/${id}/request-completion`).then((r) => r.data);

export const reviewCompletion = (id, { decision, certificateLink }) =>
    apiClient.patch(`/course-enrollments/${id}/review`, { decision, certificateLink }).then((r) => r.data);
