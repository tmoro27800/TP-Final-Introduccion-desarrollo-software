import { useState, useEffect } from "react";

// Cicla un array de sprites a intervalo fijo, en loop — para animaciones de
// ambiente que no dependen de una acción del jugador (título, lava, láser,
// etc). "frames" tiene que ser una referencia estable (una constante de
// módulo, no un array literal nuevo en cada render) para que el intervalo
// no se reinicie solo. Con un solo frame no arranca ningún intervalo, no
// hay nada que animar.
export function useCicloDeFrames(frames, msPorFrame = 200) {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        if (frames.length <= 1) return;
        const intervalo = setInterval(() => {
            setIndice((i) => (i + 1) % frames.length);
        }, msPorFrame);
        return () => clearInterval(intervalo);
    }, [frames.length, msPorFrame]);

    return frames[indice % frames.length];
}

// Como useCicloDeFrames, pero recorre los frames UNA SOLA VEZ y se queda
// clavado en el último en vez de volver al 0 — para efectos transitorios
// (power-up agarrado, caja destruida) que un componente padre desmonta
// apenas termina el ciclo (ver useEfectoPowerUp.js / useEfectosDestruccion.js).
// Con useCicloDeFrames + un setTimeout de desmontaje separado, ambos timers
// arrancan juntos y en el instante exacto en que debía desmontarse, el
// intervalo de acá a veces ya había alcanzado a volver a dar la vuelta al
// frame 0 — se veía como si la animación "se repitiera" un toque antes de
// desaparecer. Al no volver nunca al 0, no importa si el desmontaje tarda
// un toque más: como mucho se queda quieto en el último frame un instante.
export function useCicloUnaVez(frames, msPorFrame = 200) {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        if (frames.length <= 1) return;
        const intervalo = setInterval(() => {
            setIndice((i) => Math.min(i + 1, frames.length - 1));
        }, msPorFrame);
        return () => clearInterval(intervalo);
    }, [frames.length, msPorFrame]);

    return frames[indice];
}
