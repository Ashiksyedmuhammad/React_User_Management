import axios from 'axios';
import { store } from '../redux/store';
import { logout, refreshToken } from '../redux/slices/authSlice';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

// Include access token in request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers['Authorization']);
    }
    return config;
});

// Handle expired tokens
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('Inside the middleware')
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Detected 401 error, attempting token refresh...');
            originalRequest._retry = true;
            const storedRefreshToken = localStorage.getItem('refreshToken');
            try {
                const refreshResponse = await apiClient.post('http://localhost:3000/api/auth/refreshToken', { refreshToken: storedRefreshToken }, {
                    withCredentials: true,
                });

                const newAccessToken = refreshResponse.data.token;
                localStorage.setItem('token', newAccessToken);

                store.dispatch(refreshToken(newAccessToken));

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                console.log('Token updated using refresh token!')
                return apiClient(originalRequest);
            } catch (refreshError: any) {
                if (refreshError.response && refreshError.response.status === 403) {
                    console.warn('Refresh token is invalid or expired.');
                    store.dispatch(logout());
                    window.location.href = '/login';
                }
                console.error('Token refresh failed:', refreshError);

                store.dispatch(logout());

                window.location.href = '/login';
            }
        }

        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
