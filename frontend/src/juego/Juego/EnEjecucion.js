import { useState, useEffect } from "react";
import { useConfiguracion } from "../Configuracion/ConfiguracionContext.jsx";
import { crearEstadoInicial, calcularSiguienteEstado, reiniciarNivel, reiniciarNivelCompleto } from "./motorJuego.js";

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
                if (estado.estado !== "jugando") return;
                setEstado((prev) => reiniciarNivel(prev));
                return;
            }

            const direccion = resolverDireccion(e.key);
            if (!direccion) return; // tecla que no nos interesa
            setEstado((prev) => calcularSiguienteEstado(prev, direccion));
        }

        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
        // sin array de dependencias a propósito: así "resolverDireccion" siempre
        // usa los controles más actualizados en cada tecla presionada (pueden
        // cambiar en cualquier momento si el usuario los reasigna desde el menú)
    });

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
        reiniciar: () => setEstado((prev) => reiniciarNivel(prev)),
        // "Repetir nivel" en la pantalla de victoria (Nivel.jsx): a diferencia
        // de la tecla R, acá movimientos/muertes también vuelven a cero.
        reiniciarCompleto: () => setEstado((prev) => reiniciarNivelCompleto(prev)),
    };
}
