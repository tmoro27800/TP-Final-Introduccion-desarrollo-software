import { api } from './api';

export const getPistasPorNivel = async (nivelId) => {
    const response = await api.get(`/api/pistas?nivel=${nivelId}`);
    return response.data;
};

export const getPista = async (id) => {
    const response = await api.get(`/api/pistas/${id}`);
    return response.data;
};


export const createPista = async ({ level_id, texto, orden }) => {
  return api.post('/api/pistas', { level_id, texto, orden });
};

export const updatePista = async (id, { texto, orden }) => {
  return api.put(`/api/pistas/${id}`, { texto, orden });
};

export const deletePista = async (id) => {
  return api.delete(`/api/pistas/${id}`);
};