import apiClient from './apiClient';

const API = '/skills';
export const getSkills = async () => {
    const { data } = await apiClient.get(API);
    return data ?? [];
};