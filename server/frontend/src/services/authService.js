import apiClient from './apiClient';

export const loginUser = (email, password) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data);

export const logoutUser = () =>
    apiClient.post('/auth/logout').then((r) => r.data);

export const getMe = () =>
    apiClient.get('/auth/me').then((r) => r.data);
