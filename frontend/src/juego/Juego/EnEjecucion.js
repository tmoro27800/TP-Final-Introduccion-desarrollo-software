import { useState, useEffect } from "react";
 
// por ahora solo flechas — más adelante esto puede salir de la
// configuración de teclas que armaste en Menu.jsx
const DIRECCIONES = {
    ArrowUp: { df: -1, dc: 0 },
    ArrowDown: { df: 1, dc: 0 },
    ArrowLeft: { df: 0, dc: -1 },
    ArrowRight: { df: 0, dc: 1 },
};
 
const VALOR_META = 3;
 
export default function useJuego(nivel) {
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
 
    useEffect(() => {
        function manejarTecla(e) {
            const direccion = DIRECCIONES[e.key];
            if (!direccion) return; // tecla que no nos interesa
            mover(direccion);
        }
 
        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
        // sin array de dependencias a propósito: así "mover" siempre
        // usa el jugador/estado más actualizado en cada tecla presionada
    });
 
    return { jugador, movimientos, estado };
}