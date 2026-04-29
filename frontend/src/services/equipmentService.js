import api from "./api";

export const getMyEquipmentRequests = async () => {
    const res = await api.get('/equipment/my-requests');
    return res.data;
};

export const submitEquipmentRequest = async (data) => {
    const res = await api.post('/equipment/submit', data);
    return res.data;
}

export const fetchEquipmentForApproval = async () => {
    const res = await api.get('/equipment/for-approval');
    return res.data;
};

export const updateEquipmentStatus = async (payload) => {
    const res = await api.post('/equipment/update-status', payload);
    return res.data;
};