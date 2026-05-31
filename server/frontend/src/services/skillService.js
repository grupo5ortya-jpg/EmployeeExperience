import axios from 'axios';

const API = '/skills';
import apiClient from './apiClient';
export const getSkills = async () => {
    const { data } = await apiClient.get(API);
    return data;
};