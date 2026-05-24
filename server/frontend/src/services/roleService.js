import apiClient from './apiClient';

export const getRoles = async () => {
    const response = await apiClient.get('/role');
    return response.data;
};
