import { useState, useEffect, useRef } from "react";
import { SPRITES_CAJA_DESTRUIDA } from "./sprites.js";

const MS_POR_FRAME = 150;
const DURACION_MS = SPRITES_CAJA_DESTRUIDA.length * MS_POR_FRAME;

// motorJuego.js emite un ultimoEvento con posición cada vez que una caja se
// destruye (por Fuerza o empujada al vacío, ver destruirCaja/empujarCaja).
// Acá se convierte en una lista de overlays con vida propia que Tablero.jsx
// dibuja encima de la celda — se agregan solos y se autolimpian solos,
// nadie tiene que "apagarlos" a mano (mismo patrón que las estelas del
// personaje en useAnimacionJugador.js).
export function useEfectosDestruccion(ultimoEvento) {
    const [efectos, setEfectos] = useState([]);
    const idProcesadoRef = useRef(null);

    useEffect(() => {
        if (!ultimoEvento || ultimoEvento.id === idProcesadoRef.current) return;
        idProcesadoRef.current = ultimoEvento.id;
        if (ultimoEvento.tipo !== "caja-destruida" || !ultimoEvento.posicion) return;

        const efecto = { id: ultimoEvento.id, ...ultimoEvento.posicion };
        setEfectos((prev) => [...prev, efecto]);
        const timeout = setTimeout(() => {
            setEfectos((prev) => prev.filter((e) => e.id !== efecto.id));
        }, DURACION_MS);
        return () => clearTimeout(timeout);
    }, [ultimoEvento]);

    return efectos;
}

export { MS_POR_FRAME as MS_POR_FRAME_CAJA_DESTRUIDA };
