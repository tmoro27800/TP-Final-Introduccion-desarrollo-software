import { api } from './api';
 
import nivelesMock from '../game/SelectionLevel/Niveles.mock.json';
import nivelesDetalleMock from '../game/SelectionLevel/NivelesDetalle.mock.json';
 
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
 
/**
 * Trae un nivel puntual (mapa + metadata) por su id.
 * Usado en: Game.jsx, al entrar a jugar un nivel.
 */
export const getLevelByNumber = async (nivelId) => {
    const response = await api.get(`/api/niveles/${nivelId}`);
    return response.data;
};

/**
 * MOCK: Simulamos una petición de niveles por dificultad.
 * Esta función se usa en SelectionLevel.jsx, para mostrar
 * los niveles filtrados por dificultad.
 *
 * nivelesMock ya viene separado por dificultad como clave del objeto
 * ({ normal: [...], dificil: [...] }), así que no hace falta filtrar
 * nada — accedemos directo con la clave.
 */
export const getLevelsByDifficultyMock = async (dificultadId) => {
    return nivelesMock[dificultadId];
};

/**
 * MOCK: simula GET /api/niveles/:id — trae el nivel completo
 * (id, nombre, dificultad y el mapa) para jugarlo en Game.jsx.
 *
 * nivelesDetalleMock viene indexado por id como string
 * ({ "1": {...}, "2": {...} }), por eso el String(nivelId).
 */
export const getLevelByIdMock = async (nivelId) => {
    console.log(nivelesDetalleMock);
    return nivelesDetalleMock[String(nivelId)];
};