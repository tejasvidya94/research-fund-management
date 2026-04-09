import api from "./api";

export const getMyEquipmentRequests = async () => {
    const res = await api.get('/equipment/my-requests');
    return res.data;
};

export const submitEquipmentRequest = async (data) => {
    const res = await api.post('/equipment/submit', data);
    return res.data;
}