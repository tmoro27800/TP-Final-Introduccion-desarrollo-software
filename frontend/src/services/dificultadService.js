import { api } from './api';

// GET: Obtener todas las dificultades
export const getDificultades = async () => {
    const response = await api.get('/dificultades');
    return response.data;
};

// GET: Obtener todos los niveles de una dificultad
export const getNivelesPorDificultad = async (dificultadId) => {
    const response = await api.get(`/niveles?dificultad=${dificultadId}`);
    return response.data;
};
