import { useState, useEffect, useRef } from "react";
import { useConfiguracion } from "../Configuracion/ConfiguracionContext.jsx";
import {
    crearEstadoInicial,
    calcularSiguienteEstado,
    reiniciarNivel,
    reiniciarNivelCompleto,
    puertaAbierta,
    puertaConLlaveAbierta,
    chocoConPared,
    pisoLaserApagado,
} from "./motorJuego.js";

// Las flechas son una alternativa FIJA a los controles configurables —
// así lo anuncia el modal "Cómo jugar" en Menu.jsx ("Flechas: alternativa
// a WASD") — y siempre funcionan, se hayan reasignado o no las teclas.
const DIRECCIONES_FIJAS = {
    ArrowUp: { df: -1, dc: 0 },
    ArrowDown: { df: 1, dc: 0 },
    ArrowLeft: { df: 0, dc: -1 },
    ArrowRight: { df: 0, dc: 1 },
};

// Reinicio manual del nivel, igual que en el boceto de referencia. Fija
// (no configurable) por la misma razón que las flechas.
const TECLA_REINICIO = "R";

// Wrapper fino de React sobre motorJuego.js: mantiene el estado de la
// partida en useState y traduce teclado -> acciones del motor. Toda la
// lógica de qué hace cada mecánica vive en motorJuego.js, no acá.
export default function useJuego(nivelPreparado) {
    // Teclas configurables (por defecto WASD, reasignables desde el menú
    // de Configuración). Ver ConfiguracionContext.jsx / configuracionDefault.js.
    const { controles } = useConfiguracion();

    const [estado, setEstado] = useState(() => crearEstadoInicial(nivelPreparado));

    // Señal para la animación del personaje (ver useAnimacionJugador.js):
    // cada intento de movimiento (haya tenido efecto o no) arma un objeto
    // nuevo con "id" único, así el hook de animación puede detectar
    // "esto ya lo procesé" sin depender de que la posición haya cambiado
    // (ej. el modo fuerza destruye una caja sin mover al jugador, pero
    // igual hay que saber que "intentó" moverse hacia esa dirección).
    const [ultimoIntento, setUltimoIntento] = useState(null);

    // El listener de keydown se registra UNA sola vez (array de dependencias
    // vacío más abajo) en vez de sacarlo y volver a ponerlo en cada render
    // (que era lo que hacía antes, a propósito, para que la tecla siempre
    // viera el estado/controles más actualizados). Al no volver a crearse,
    // ya no puede cerrar sobre "estado"/"controles" frescos por closure —
    // por eso se leen desde refs, actualizados en cada render sin efecto
    // propio, que es el patrón estándar de React para esto.
    const estadoRef = useRef(estado);
    estadoRef.current = estado;
    const controlesRef = useRef(controles);
    controlesRef.current = controles;

    // Resuelve qué dirección corresponde a una tecla: primero mira las
    // flechas (fijas), después las teclas configurables (comparando en
    // mayúsculas, igual que como se guardan en ConfiguracionContext).
    function resolverDireccion(tecla, controlesActuales) {
        if (DIRECCIONES_FIJAS[tecla]) return DIRECCIONES_FIJAS[tecla];

        const teclaNormalizada = tecla.toUpperCase();
        if (teclaNormalizada === controlesActuales.arriba) return { df: -1, dc: 0 };
        if (teclaNormalizada === controlesActuales.abajo) return { df: 1, dc: 0 };
        if (teclaNormalizada === controlesActuales.izquierda) return { df: 0, dc: -1 };
        if (teclaNormalizada === controlesActuales.derecha) return { df: 0, dc: 1 };

        return null;
    }

    useEffect(() => {
        function manejarTecla(e) {
            // Si el foco está en un <input>/<textarea> (ej. el nombre para
            // guardar el puntaje al ganar), ninguna tecla del juego tiene que
            // hacer nada — si no, escribir una "r" en el nombre reiniciaba
            // el nivel en el medio de completar el formulario.
            const enCampoDeTexto =
                e.target instanceof HTMLElement &&
                (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
            if (enCampoDeTexto) return;

            // R reinicia manualmente, pero solo mientras se está jugando —
            // ya ganado el nivel, ninguna tecla debería alterar el estado.
            if (e.key.toUpperCase() === TECLA_REINICIO) {
                if (estadoRef.current.estado !== "jugando") return;
                setEstado((prev) => reiniciarNivel(prev));
                return;
            }

            const direccion = resolverDireccion(e.key, controlesRef.current);
            if (!direccion) return; // tecla que no nos interesa

            const estadoActual = estadoRef.current;
            const siguiente = calcularSiguienteEstado(estadoActual, direccion);
            const exitoso = siguiente !== estadoActual; // el motor tuvo algún efecto
            const movioPosicion =
                exitoso &&
                (siguiente.jugador.fila !== estadoActual.jugador.fila ||
                    siguiente.jugador.columna !== estadoActual.jugador.columna);
            // reiniciarNivel(estado, {porMuerte}) deja un ultimoEvento tipo
            // "muerte-<motivo>" — así useAnimacionJugador.js distingue "murió
            // y lo tele transportó al inicio" de un paso normal (que también
            // mueve al jugador, pero no debería jugar la animación de golpe).
            const tipoEvento = siguiente.ultimoEvento?.tipo;
            const murio = exitoso && tipoEvento?.startsWith("muerte-") === true;
            const motivoMuerte = murio ? tipoEvento.slice("muerte-".length) : null;

            // El resto son solo para useSonidosDeJuego.js (ver motorJuego.js:
            // chocoConPared/pisoLaserApagado para el porqué de calcularlos acá
            // en vez de en el motor).
            const chocoPared = !exitoso && chocoConPared(estadoActual, direccion);
            const pisoLaserSeguro = exitoso && !murio && pisoLaserApagado(estadoActual, direccion);
            const atravesoPared =
                exitoso && !murio && estadoActual.habilidadActiva === "fantasma" && siguiente.habilidadActiva !== "fantasma";

            setUltimoIntento({
                id: `${Date.now()}-${Math.random()}`,
                direccion,
                exitoso,
                movioPosicion,
                murio,
                motivoMuerte,
                chocoPared,
                pisoLaserSeguro,
                atravesoPared,
                posicionFinal: siguiente.jugador,
                posicionAnterior: estadoActual.jugador,
            });
            setEstado(siguiente);
        }

        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
    }, []);

    return {
        jugador: estado.jugador,
        cajas: estado.cajas,
        llaves: estado.llaves,
        pickups: estado.pickups,
        totalLlaves: estado.totalLlaves,
        habilidadActiva: estado.habilidadActiva,
        movimientos: estado.movimientos,
        muertes: estado.muertes,
        estado: estado.estado,
        ultimoEvento: estado.ultimoEvento,
        ultimoIntento,
        botonesPresionados: estado.botonesPresionados,
        puentes: estado.puentes,
        puertaAbierta: puertaAbierta(estado),
        puertaConLlaveAbierta: puertaConLlaveAbierta(estado),
        reiniciar: () => setEstado((prev) => reiniciarNivel(prev)),
        // "Repetir nivel" en la pantalla de victoria (Nivel.jsx): a diferencia
        // de la tecla R, acá movimientos/muertes también vuelven a cero.
        reiniciarCompleto: () => setEstado((prev) => reiniciarNivelCompleto(prev)),
    };
}
