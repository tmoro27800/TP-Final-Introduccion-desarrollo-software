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
export function useEfectoPowerUp(ultimoEvento) {
    const [efecto, setEfecto] = useState(null);
    const idProcesadoRef = useRef(null);

    useEffect(() => {
        if (!ultimoEvento || ultimoEvento.id === idProcesadoRef.current) return;
        idProcesadoRef.current = ultimoEvento.id;
        if (!ultimoEvento.tipo?.startsWith("pickup-") || !ultimoEvento.posicion) return;

        const nuevoEfecto = { id: ultimoEvento.id, ...ultimoEvento.posicion };
        setEfecto(nuevoEfecto);
        const timeout = setTimeout(() => {
            setEfecto((actual) => (actual?.id === nuevoEfecto.id ? null : actual));
        }, DURACION_MS);
        return () => clearTimeout(timeout);
    }, [ultimoEvento]);

    return efecto;
}

export { MS_POR_FRAME as MS_POR_FRAME_POWERUP };
