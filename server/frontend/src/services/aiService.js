import apiClient from './apiClient';

export const getMentorSuggestions = async (payload) => {
    const response = await apiClient.post(
        '/ai/mentor-matching',
        payload
    );

    return response.data;
};