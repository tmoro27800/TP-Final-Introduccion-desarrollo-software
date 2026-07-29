import { api } from './api';

// GET: Obtener todas las dificultades — [{ id, nombre, descripcion }].
// Usado en: SeleccionModo.jsx (para no tener la descripción de cada modo
// hardcodeada dos veces, ver dificultad.descripcion en la base).
export const getDificultades = async () => {
    const response = await api.get('/api/dificultades');
    return response.data;
};

// GET: Obtener todos los niveles de una dificultad
export const getNivelesPorDificultad = async (dificultadId) => {
    return api.get(`/api/niveles?dificultad=${dificultadId}`);
};

export const createDificultad = async ({ nombre, orden }) => {
  return api.post('/api/dificultad', { nombre, orden });
};

export const updateDificultad = async (id, { nombre, orden }) => {
  return api.put(`/api/dificultad/${id}`, { nombre, orden });
};

export const deleteDificultad = async (id) => {
  return api.delete(`/api/dificultad/${id}`);
};
