import { api } from './api';

/**
 * Trae los niveles filtrados por dificultad.
 * Usado en: pantalla de selección de nivel, filtrado por dificultad.
 */
export const getNivelesPorDificultad = async (dificultadId) => {
    const response = await api.get('/api/niveles', {
        params: { dificultad: dificultadId },
    });
    return response.data;
};

/**
 * Trae un nivel puntual (mapa + metadata) por su id.
 * Usado en: Game.jsx, al entrar a jugar un nivel.
 */
export const getNivelPorId = async (nivelId) => {
    const response = await api.get(`/api/niveles/${nivelId}`);
    return response.data;
};