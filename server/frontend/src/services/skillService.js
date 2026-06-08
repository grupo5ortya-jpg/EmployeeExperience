import apiClient from './apiClient';

const API = '/skills';
export const getSkills = async () => {
    const { data } = await apiClient.get(API);
    return data ?? [];
};

export const createSkill = async (payload) => {
    const { data } = await apiClient.post(API, payload);
    return data;
};