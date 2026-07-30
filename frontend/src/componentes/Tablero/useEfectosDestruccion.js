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
//
// OJO: a propósito NO se devuelve `() => clearTimeout(timeout)` como cleanup
// de este efecto. Si se hace, React lo ejecuta en CUALQUIER cambio futuro de
// ultimoEvento (por ejemplo el siguiente movimiento del jugador, aunque sea
// uno cualquiera sin relación con esta caja) — eso cancelaba el timeout
// recién creado antes de que llegara a disparar, y el overlay se quedaba
// pegado en el tablero para siempre si el jugador se movía de nuevo antes de
// que termine su animación (ej. entrando enseguida a la celda de la caja
// recién destruida).
export function useEfectosDestruccion(ultimoEvento) {
    const [efectos, setEfectos] = useState([]);
    const idProcesadoRef = useRef(null);

    useEffect(() => {
        if (!ultimoEvento || ultimoEvento.id === idProcesadoRef.current) return;
        idProcesadoRef.current = ultimoEvento.id;
        if (ultimoEvento.tipo !== "caja-destruida" || !ultimoEvento.posicion) return;

        const efecto = { id: ultimoEvento.id, ...ultimoEvento.posicion };
        setEfectos((prev) => [...prev, efecto]);
        setTimeout(() => {
            setEfectos((prev) => prev.filter((e) => e.id !== efecto.id));
        }, DURACION_MS);
    }, [ultimoEvento]);

    return efectos;
}

export { MS_POR_FRAME as MS_POR_FRAME_CAJA_DESTRUIDA };
