import api from './api';

export const getCurrentUser = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

export const loginUser = async (credentials) => {
    const res = await api.post('/auth/login', credentials, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.data;
}

export const signupUser = async () => {
    const res = await api.post('/auth/signup');
    return res.data;
}