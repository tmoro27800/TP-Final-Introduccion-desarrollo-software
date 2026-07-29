import { api } from "./api";

/**
 * Trae los consejos de un nivel, ya ordenados (por "orden") para
 * revelarlos de a uno del lado del cliente. Usado en: juego/Consejos/useConsejos.js.
 */
export const getConsejosPorNivel = async (nivelId) => {
    const response = await api.get("/api/consejos", { params: { nivel: nivelId } });
    return response.data;
};
