import axios from 'axios';

import apiClient from './apiClient';
const API = '/job-openings';



export const getJobOpenings = async () => {
    const { data } = await apiClient.get(API)
    return data
}

export const getJobOpeningById = async (id) => {
    const { data } = await apiClient.get(`${API}/${id}`)
    return data
}

export const createJobOpening = async (payload) => {
    const { data } = await apiClient.post(API, payload)
    return data
}

export const updateJobOpening = async (id, payload) => {
    const { data } = await apiClient.patch(`${API}/${id}`, payload)
    return data
}