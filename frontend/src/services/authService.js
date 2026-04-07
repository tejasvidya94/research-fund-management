import api from './api';

export const getCurrentUser = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};