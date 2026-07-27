import { useState, useEffect } from "react";
import { useConfiguracion } from "../Configuracion/ConfiguracionContext.jsx";

// Las flechas son una alternativa FIJA a los controles configurables —
// así lo anuncia el modal "Cómo jugar" en Menu.jsx ("Flechas: alternativa
// a WASD") — y siempre funcionan, se hayan reasignado o no las teclas.
const DIRECCIONES_FIJAS = {
    ArrowUp: { df: -1, dc: 0 },
    ArrowDown: { df: 1, dc: 0 },
    ArrowLeft: { df: 0, dc: -1 },
    ArrowRight: { df: 0, dc: 1 },
};

const VALOR_META = 3;

export default function useJuego(nivel) {
    // Teclas configurables (por defecto WASD, reasignables desde el menú
    // de Configuración). Ver ConfiguracionContext.jsx / configuracionDefault.js.
    const { controles } = useConfiguracion();

    const [jugador, setJugador] = useState(nivel.jugadorInicial);
    const [movimientos, setMovimientos] = useState(0);
    const [estado, setEstado] = useState("jugando"); // "jugando" | "ganado"

    function esMovimientoValido(destino) {
        const filaValida = destino.fila >= 0 && destino.fila < nivel.mapa.length;
        const columnaValida = destino.columna >= 0 && destino.columna < nivel.mapa[0].length;
        if (!filaValida || !columnaValida) return false; // se sale del tablero

        const esPared = nivel.mapa[destino.fila][destino.columna] === 1;
        if (esPared) return false;

        return true;
    }

    function mover(direccion) {
        if (estado !== "jugando") return; // ya ganaste, ignorar más teclas

        const destino = {
            fila: jugador.fila + direccion.df,
            columna: jugador.columna + direccion.dc,
        };

        if (!esMovimientoValido(destino)) return; // movimiento inválido: no hace nada

        setJugador(destino);
        setMovimientos((m) => m + 1);

        const llegoALaMeta = nivel.mapa[destino.fila][destino.columna] === VALOR_META;
        if (llegoALaMeta) setEstado("ganado");
    }

    // Resuelve qué dirección corresponde a una tecla: primero mira las
    // flechas (fijas), después las teclas configurables (comparando en
    // mayúsculas, igual que como se guardan en ConfiguracionContext).
    function resolverDireccion(tecla) {
        if (DIRECCIONES_FIJAS[tecla]) return DIRECCIONES_FIJAS[tecla];

        const teclaNormalizada = tecla.toUpperCase();
        if (teclaNormalizada === controles.arriba) return { df: -1, dc: 0 };
        if (teclaNormalizada === controles.abajo) return { df: 1, dc: 0 };
        if (teclaNormalizada === controles.izquierda) return { df: 0, dc: -1 };
        if (teclaNormalizada === controles.derecha) return { df: 0, dc: 1 };

        return null;
    }

    useEffect(() => {
        function manejarTecla(e) {
            const direccion = resolverDireccion(e.key);
            if (!direccion) return; // tecla que no nos interesa
            mover(direccion);
        }

        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
        // sin array de dependencias a propósito: así "mover" y "resolverDireccion"
        // siempre usan el jugador/estado/controles más actualizados en cada
        // tecla presionada (los controles pueden cambiar en cualquier momento
        // si el usuario los reasigna desde el menú)
    });

    return { jugador, movimientos, estado };
}
