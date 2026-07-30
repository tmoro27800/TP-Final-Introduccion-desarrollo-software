import { useState, useEffect, useRef } from "react";
import { SPRITES_JUGADOR, SPRITES_CUBO, FRAMES } from "./spritesJugador.js";

const MS_POR_FRAME = 90; // caminar / error — snappy, pixel art
const MS_POR_FRAME_QUIETO = 220; // reposo/partículas — más lento, "respirando"
const DURACION_ESTELA_MS = 220;

function direccionATexto({ df, dc }) {
    if (df === -1) return "arriba";
    if (df === 1) return "abajo";
    if (dc === -1) return "izquierda";
    if (dc === 1) return "derecha";
    return "abajo";
}

// Arma el estado de animación del personaje (qué sprite mostrar en cada
// capa: cuerpo, viento, partículas, estelas) a partir de la posición y de
// "ultimoIntento" que expone EnEjecucion.js. No sabe nada de reglas del
// juego — motorJuego.js sigue sin saber que esto existe.
export function useAnimacionJugador({ habilidadActiva, ultimoIntento }) {
    const [direccionMirando, setDireccionMirando] = useState("abajo");
    const [accion, setAccion] = useState("quieto"); // "quieto" | "caminando" | "error"
    const [frame, setFrame] = useState(0);
    const [frameQuieto, setFrameQuieto] = useState(0);
    const [ventoDireccion, setVentoDireccion] = useState(null);
    const [estelas, setEstelas] = useState([]);
    const idProcesadoRef = useRef(null);

    // 1) reacciona a cada intento de movimiento nuevo (exitoso o no)
    useEffect(() => {
        if (!ultimoIntento || ultimoIntento.id === idProcesadoRef.current) return;
        idProcesadoRef.current = ultimoIntento.id;

        const direccionTexto = direccionATexto(ultimoIntento.direccion);
        setDireccionMirando(direccionTexto);
        setFrame(0);

        // "error" cubre tres casos: un movimiento sin efecto (chocar contra
        // una pared, empujar una caja trabada), morir (lava/láser/vacío/
        // puente colapsado) y pisar pinchos (duele pero no mata) — los tres
        // son "algo salió mal, el cubo lo sufre", y morir además mueve al
        // jugador de vuelta al inicio, así que sin este chequeo se
        // confundía con un paso caminando normal.
        if (!ultimoIntento.exitoso || ultimoIntento.murio || ultimoIntento.pisoPinchos) {
            setAccion("error");
            return;
        }

        if (!ultimoIntento.movioPosicion) {
            // tuvo efecto pero no se movió (ej. fuerza destruye una caja) —
            // no hay animación de caminar/error para eso, solo actualiza
            // hacia dónde mira.
            setAccion("quieto");
            return;
        }

        setAccion("caminando");
        setVentoDireccion(direccionTexto);

        const idEstela = ultimoIntento.id;
        setEstelas((prev) => [...prev, { id: idEstela, ...ultimoIntento.posicionAnterior, direccion: direccionTexto }]);
        setTimeout(() => {
            setEstelas((prev) => prev.filter((e) => e.id !== idEstela));
        }, DURACION_ESTELA_MS);
    }, [ultimoIntento]);

    // 2) avanza los frames de "caminando"/"error"; al terminar el ciclo
    // vuelve a "quieto"
    useEffect(() => {
        if (accion === "quieto") return;
        const totalFrames = accion === "error" ? FRAMES.error : FRAMES.caminar;

        const timeout = setTimeout(() => {
            if (frame + 1 >= totalFrames) {
                setAccion("quieto");
                setVentoDireccion(null);
                setFrame(0);
            } else {
                setFrame((f) => f + 1);
            }
        }, MS_POR_FRAME);

        return () => clearTimeout(timeout);
    }, [accion, frame]);

    // 3) loop de reposo/partículas ambiente, siempre corriendo de fondo
    useEffect(() => {
        const intervalo = setInterval(() => {
            setFrameQuieto((f) => (f + 1) % FRAMES.quieto);
        }, MS_POR_FRAME_QUIETO);
        return () => clearInterval(intervalo);
    }, []);

    const grupo = SPRITES_JUGADOR[habilidadActiva ?? "base"];

    const spritePersonaje =
        accion === "error"
            ? SPRITES_JUGADOR.error[frame]
            : accion === "caminando"
              ? grupo[direccionMirando][frame]
              : grupo.quieto[frameQuieto];

    // El cubo es el cuerpo de fondo: misma acción/dirección/frame que el
    // efecto de arriba, para que las dos capas queden sincronizadas, pero
    // sale de SPRITES_CUBO (no depende de la habilidad — ver spritesJugador.js).
    const spriteCubo =
        accion === "error"
            ? SPRITES_CUBO.error[frame]
            : accion === "caminando"
              ? SPRITES_CUBO[direccionMirando][frame]
              : SPRITES_CUBO.quieto;

    // Sin habilidad activa no hay partículas ambiente (se sacó el uso de
    // Efectos/Particulas0-3.png, el set "base") — solo quedan las de cada
    // habilidad (Fantasma/Fuerza/Invulnerabilidad tienen su propio set con
    // el mismo nombre de archivo, en su propia subcarpeta).
    const spriteParticulas = habilidadActiva ? grupo.particulas[frameQuieto % FRAMES.particulas] : null;
    const spriteViento = ventoDireccion ? grupo.viento[ventoDireccion][Math.min(frame, FRAMES.viento - 1)] : null;

    return {
        spritePersonaje,
        spriteCubo,
        spriteParticulas,
        spriteViento,
        ventoDireccion,
        spriteEstela: grupo.estela,
        estelas,
        direccionMirando,
    };
}
