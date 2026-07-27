import { api } from './api';

// Canónico (API Contract): GET /api/puntajes?nivel=&dificultad=
// Devuelve [{ jugador, movimientos, tiempo }], usado por Puntaje.jsx.
// "nivel" es obligatorio del lado del backend (no hay modo libre).
export const getPuntajesPorNivel = async (nivelId, dificultadId) => {
  const response = await api.get('/api/puntajes', {
    params: { nivel: nivelId, dificultad: dificultadId },
  });
  return response.data;
};

// Canónico (API Contract): POST /api/puntajes { nivel, dificultad, jugador, movimientos, tiempo }
// Guarda el resultado de una partida recién completada. Usado por Juego.jsx
// al ganar un nivel.
export const crearPuntaje = async ({ nivel, dificultad, jugador, movimientos, tiempo }) => {
  const response = await api.post('/api/puntajes', { nivel, dificultad, jugador, movimientos, tiempo });
  return response.data;
};

// --- Alias viejo (/scores, en inglés) — se mantiene por compatibilidad,
// no usar en código nuevo. Ver backend/src/routes/README.md. ---

export const getAllScores = async () => {
    return api.get('/api/scores');
};

export const getScorebyId = async (scoreId) => {
    return api.get(`/api/scores/${scoreId}`);
};

export const getScoresbyLevelAndDifficulty = async (nivelId, dificultadId) => {
   return api.get(`/api/scores?nivel=${nivelId}&dificultad=${dificultadId}`);
};

export const getScoresbyLevel = async (nivelId) => {
    return api.get(`/api/scores/level/${nivelId}/top`);
};

export const getGlobalRanking = async () => {
  return api.get('/api/scores/ranking/global');
};

export const createScore = async ({ level_id, player_name, moves, time_seconds }) => {
  return api.post('/api/scores', { level_id, player_name, moves, time_seconds });
};

export const updateScore = async (id, { player_name, moves, time_seconds }) => {
  return api.put(`/api/scores/${id}`, { player_name, moves, time_seconds });
};

export const deleteScore = async (id) => {
  return api.delete(`/api/scores/${id}`);
};
