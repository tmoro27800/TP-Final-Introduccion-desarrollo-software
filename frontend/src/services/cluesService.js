import { api } from './api';

export const getPistas = async () => {
    const response = await api.get('/api/pistas');
    return response.data;
};

export const getPista = async (id) => {
    const response = await api.get(`/api/pistas/${id}`);
    return response.data;
};

export const getPistasPorNivel = async (nivelId) => {
    const response = await api.get(`/api/pistas?nivel=${nivelId}`);
    return response.data;
};