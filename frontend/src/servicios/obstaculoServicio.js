import { api } from "./api";

/**
 * Trae el glosario completo de mecánicas (ex "powerups", nunca usado desde
 * acá) ya ordenado para mostrar. Usado en: modal "Cómo jugar > Mecánicas"
 * (ver Menu.jsx / mecanicasInfo.js).
 */
export const getObstaculos = async () => {
    const response = await api.get("/api/obstaculos");
    return response.data;
};
