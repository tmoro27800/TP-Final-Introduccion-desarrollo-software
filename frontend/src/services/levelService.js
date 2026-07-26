import { api } from './api';

import nivelesMock from '../game/SelectionLevel/Niveles.mock.json';

/**
 * Trae el listado completo de niveles.
 * Usado en: pantalla de selección de nivel.
 */
export const getAllLevels = async () => {
    const response = await api.get('/api/niveles');
    return response.data;
};

/**
 * Trae un nivel puntual (mapa + metadata) por su id.
 * Usado en: Game.jsx, al entrar a jugar un nivel.
 */
export const getLevelById = async (nivelId) => {
    const response = await api.get(`/api/niveles/${nivelId}`);
    return response.data;
};

/**
 * Trae los niveles filtrados por dificultad.
 * Usado en: pantalla de selección de nivel, filtrado por dificultad.
 */
export const getLevelsByDifficulty = async (dificultadId) => {
    const response = await api.get('/api/niveles', {
        params: { dificultad: dificultadId },
    });
    return response.data;
};

export const getLevelsByDifficultyMock = async (dificultadId) => {
    return nivelesMock[dificultadId];
};

/**
 * Trae un nivel puntual (mapa + metadata) por su id.
 * Usado en: Game.jsx, al entrar a jugar un nivel.
 */
export const getLevelByNumber = async (nivelId) => {
    const response = await api.get(`/api/niveles/${nivelId}`);
    return response.data;
};