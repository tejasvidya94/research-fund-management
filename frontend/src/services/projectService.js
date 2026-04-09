import api from "./api";

export const getMyProjects = async () => {
    const res = await api.get('/projects/my-projects');
    return res.data;
};

export const submitProject = async (payload) => {
    const res = await api.post('/projects/submit', payload);
    return res.data;
};

export const resubmitProject = async (payload) => {
    const res = await api.post('/projects/resubmit', payload);
    return res.data;
};