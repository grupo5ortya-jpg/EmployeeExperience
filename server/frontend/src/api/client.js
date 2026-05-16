import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;