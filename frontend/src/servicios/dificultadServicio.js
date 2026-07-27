import { api } from './api';

// GET: Obtener todas las dificultades
export const getDificultades = async () => {
    return api.get('/dificultades');

};

// GET: Obtener todos los niveles de una dificultad
export const getNivelesPorDificultad = async (dificultadId) => {
    return api.get(`/niveles?dificultad=${dificultadId}`);
};

export const createDificultad = async ({ nombre, orden }) => {
  return api.post('/dificultad', { nombre, orden });
};

export const updateDificultad = async (id, { nombre, orden }) => {
  return api.put(`/dificultad/${id}`, { nombre, orden });
};

export const deleteDificultad = async (id) => {
  return api.delete(`/dificultad/${id}`);
};
