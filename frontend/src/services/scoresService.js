import { api } from './api';

export const getAllScores = async () => {
    const response = await api.get('/api/scores');
    return response.data;
};

export const getScorebyId = async (scoreId) => {
    const response = await api.get(`/api/scores/${scoreId}`);
    return response.data;
};

export const getScoresbyLevelAndDifficulty = async (nivelId, dificultadId) => {
    const response = await api.get(`/api/scores?nivel=${nivelId}&dificultad=${dificultadId}`);
    return response.data;
};

export const getScoresbyLevel = async (nivelId) => {
    const response = await api.get(`/api/scores?nivel=${nivelId}`);
    return response.data;
};

