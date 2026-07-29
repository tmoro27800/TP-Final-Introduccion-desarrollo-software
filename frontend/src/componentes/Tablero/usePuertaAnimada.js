import { useState, useEffect, useRef } from "react";

const MS_POR_FRAME = 90;

// Frame 0 = cerrada. A diferencia de lava/láser/vacío (que ciclan en loop
// todo el tiempo), esto es una TRANSICIÓN: cuando "abierta" pasa a true
// reproduce el resto de los frames una sola vez, de una, y se queda quieta
// en el último — la puerta se desbloquea y listo, no sigue animando para
// siempre. Si el nivel se reinicia (abierta vuelve a false) se resetea
// para poder reproducirla de nuevo si se desbloquea otra vez.
//
// Genérico a propósito: lo usan tanto la puerta de botón/placa (PUERTA,
// ver SPRITES_PUERTA_PLACA) como la puerta de llave (PUERTA_CON_LLAVE,
// ver SPRITES_PUERTA_CON_LLAVE) — misma mecánica visual, sprites distintos.
export function usePuertaAnimada(frames, abierta) {
    const [frame, setFrame] = useState(0);
    const yaReproducidaRef = useRef(false);
    const ultimoFrame = frames.length - 1;

    useEffect(() => {
        if (!abierta) {
            yaReproducidaRef.current = false;
            setFrame(0);
            return;
        }
        if (yaReproducidaRef.current) return; // ya se reprodujo, se queda en el último frame

        yaReproducidaRef.current = true;
        let cancelado = false;
        let siguiente = 1;

        function avanzar() {
            if (cancelado) return;
            setFrame(siguiente);
            if (siguiente < ultimoFrame) {
                siguiente += 1;
                setTimeout(avanzar, MS_POR_FRAME);
            }
        }

        const timeout = setTimeout(avanzar, MS_POR_FRAME);
        return () => {
            cancelado = true;
            clearTimeout(timeout);
        };
    }, [abierta, frames, ultimoFrame]);

    return frames[frame];
}
