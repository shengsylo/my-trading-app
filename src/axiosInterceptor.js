// axiosInterceptor.js
import axios from 'axios';

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/authForm';
        }
        return Promise.reject(error);
    }
);
