import { api } from './api';

export const getAllScores = async () => {
    return api.get('/scores');
};

export const getScorebyId = async (scoreId) => {
    return api.get(`/scores/${scoreId}`);
};

export const getScoresbyLevelAndDifficulty = async (nivelId, dificultadId) => {
   return api.get(`/scores?nivel=${nivelId}&dificultad=${dificultadId}`);
};

export const getScoresbyLevel = async (nivelId) => {
    return api.get(`/scores/level/${nivelId}/top`);
};

export const getGlobalRanking = async () => {
  return api.get('/scores/ranking/global');
};

export const createScore = async ({ level_id, player_name, moves, time_seconds }) => {
  return api.post('/scores', { level_id, player_name, moves, time_seconds });
};

export const updateScore = async (id, { player_name, moves, time_seconds }) => {
  return api.put(`/scores/${id}`, { player_name, moves, time_seconds });
};

export const deleteScore = async (id) => {
  return api.delete(`/scores/${id}`);
};
