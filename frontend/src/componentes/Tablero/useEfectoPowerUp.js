import { useState, useEffect, useRef } from "react";
import { SPRITES_POWERUP_DESTRUIDO } from "./sprites.js";

const MS_POR_FRAME = 130;
const DURACION_MS = SPRITES_POWERUP_DESTRUIDO.length * MS_POR_FRAME;

// motorJuego.js emite un ultimoEvento "pickup-<tipo>" con posición cada vez
// que el jugador agarra un power-up (ver recogerPickup) — acá se convierte
// en un efecto transitorio en esa celda, mismo patrón que
// useEfectosDestruccion.js para las cajas. Antes disparaba recién al
// GASTARSE la habilidad (fantasma cruzando una pared, etc.), pero la
// animación representa al power-up desapareciendo del mapa, así que
// corresponde al momento de agarrarlo, no al de usarlo.
//
// OJO: a propósito NO se devuelve `() => clearTimeout(timeout)` como cleanup
// de este efecto — mismo motivo que en useEfectosDestruccion.js: React lo
// ejecutaría en CUALQUIER cambio futuro de ultimoEvento (el siguiente
// movimiento del jugador, sin relación con este pickup), cancelando el
// timeout antes de que dispare y dejando el sprite pegado para siempre si
// el jugador se movía de nuevo enseguida.
export function useEfectoPowerUp(ultimoEvento) {
    const [efecto, setEfecto] = useState(null);
    const idProcesadoRef = useRef(null);

    useEffect(() => {
        if (!ultimoEvento || ultimoEvento.id === idProcesadoRef.current) return;
        idProcesadoRef.current = ultimoEvento.id;
        if (!ultimoEvento.tipo?.startsWith("pickup-") || !ultimoEvento.posicion) return;

        const nuevoEfecto = { id: ultimoEvento.id, ...ultimoEvento.posicion };
        setEfecto(nuevoEfecto);
        setTimeout(() => {
            setEfecto((actual) => (actual?.id === nuevoEfecto.id ? null : actual));
        }, DURACION_MS);
    }, [ultimoEvento]);

    return efecto;
}

export { MS_POR_FRAME as MS_POR_FRAME_POWERUP };
