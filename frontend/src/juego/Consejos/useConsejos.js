import { useState, useCallback } from "react";
import { getConsejosPorNivel } from "../../servicios/consejoServicio.js";

// Consejos progresivos por nivel: se piden todos juntos al backend (ya
// vienen ordenados por "orden"), pero se revelan de a uno acá, en memoria
// del lado del cliente — no hace falta un viaje al backend por cada
// consejo que el jugador pide ver, ni un contador de uso server-side (por
// eso la tabla `consejos` no tiene un "veces_visto": ver db/README.md).
//
// Se piden recién la primera vez que el jugador abre el modal de consejos
// (pedirConsejos), no en cada montaje de Nivel.jsx — si nunca los pide, no
// se gasta ni un fetch.
export function useConsejos(nivelId) {
    const [consejos, setConsejos] = useState([]);
    const [cantidadRevelada, setCantidadRevelada] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [yaPedido, setYaPedido] = useState(false);

    const pedirConsejos = useCallback(() => {
        if (yaPedido) return;
        setYaPedido(true);
        setCargando(true);
        getConsejosPorNivel(nivelId)
            .then((data) => {
                setConsejos(data);
                setCantidadRevelada(data.length > 0 ? 1 : 0);
            })
            .catch(() => setConsejos([]))
            .finally(() => setCargando(false));
    }, [nivelId, yaPedido]);

    const revelarSiguiente = useCallback(() => {
        setCantidadRevelada((cantidad) => Math.min(cantidad + 1, consejos.length));
    }, [consejos.length]);

    return {
        consejosRevelados: consejos.slice(0, cantidadRevelada),
        hayMas: cantidadRevelada < consejos.length,
        totalConsejos: consejos.length,
        cargando,
        pedirConsejos,
        revelarSiguiente,
    };
}
