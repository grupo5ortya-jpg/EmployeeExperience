import axios from 'axios';

export const apiClient = axios.create({
    baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:3002',
    withCredentials: true,   // send httpOnly cookie on every request
});

export default apiClient;