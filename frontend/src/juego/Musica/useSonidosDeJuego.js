import { useEffect, useRef } from "react";
import { useEfectosSonido } from "./useEfectosSonido.js";

// Traduce los eventos/intentos que expone useJuego() (ver EnEjecucion.js y
// motorJuego.js) a efectos de sonido puntuales. Vive en su propio hook (no
// adentro de Nivel.jsx) por el mismo motivo que useEfectosDestruccion.js o
// useEfectoPowerUp.js: son varias fuentes de "esto ya pasó, no lo repitas"
// (ultimoIntento, ultimoEvento, y transiciones de un par de booleanos) y
// mezclar todo eso adentro del componente de Nivel lo haría ilegible.
export function useSonidosDeJuego({
    ultimoIntento,
    ultimoEvento,
    llaves,
    puertaAbierta,
    puertaConLlaveAbierta,
    tienePuerta,
    tienePuertaConLlave,
    estado,
}) {
    const { reproducir } = useEfectosSonido();

    // ultimoIntento: cubre movimiento, choque contra pared, muerte (y el
    // motivo, para sumarle el sonido específico del láser) y las dos
    // acciones de fantasma (traspasar pared / cruzar un láser apagado).
    const idIntentoRef = useRef(null);
    useEffect(() => {
        if (!ultimoIntento || ultimoIntento.id === idIntentoRef.current) return;
        idIntentoRef.current = ultimoIntento.id;

        if (ultimoIntento.murio) {
            reproducir("muerte");
            if (ultimoIntento.motivoMuerte === "laser") reproducir("laserActivo");
            return;
        }

        if (!ultimoIntento.exitoso) {
            if (ultimoIntento.chocoPared) reproducir("chocarPared");
            return;
        }

        if (ultimoIntento.atravesoPared) reproducir("fantasmaTraspaso");
        if (ultimoIntento.pisoLaserSeguro) reproducir("laserPreparando");
        if (ultimoIntento.movioPosicion) reproducir("mover");
    }, [ultimoIntento]);

    // ultimoEvento: llave (agarrar una, o la última de todas), pickups de
    // fantasma/fuerza, y caja destruida (por Fuerza o empujada al vacío).
    const idEventoRef = useRef(null);
    useEffect(() => {
        if (!ultimoEvento || ultimoEvento.id === idEventoRef.current) return;
        idEventoRef.current = ultimoEvento.id;

        if (ultimoEvento.tipo === "llave") {
            reproducir(llaves.length === 0 ? "todasLasLlaves" : "llave");
        } else if (ultimoEvento.tipo === "pickup-fantasma") {
            reproducir("fantasmaActivado");
        } else if (ultimoEvento.tipo === "pickup-fuerza") {
            reproducir("fuerzaActivado");
        } else if (ultimoEvento.tipo === "caja-destruida") {
            reproducir("cajaDestruida");
        }
    }, [ultimoEvento, llaves]);

    // puertaAbierta/puertaConLlaveAbierta/estado no traen su propio "id" de
    // evento (son solo booleanos/strings derivados del estado actual) — acá
    // se detecta el flanco de subida (o el cambio a "ganado") comparando
    // contra el valor anterior guardado en un ref. El gate de
    // tienePuerta/tienePuertaConLlave evita el sonido de "puerta que se
    // abre" en niveles que no tienen esa puerta — puertaConLlaveAbierta,
    // por ejemplo, es solo "no quedan llaves", así que sin el gate sonaría
    // en cualquier nivel con llaves aunque no tenga esa puerta.
    const puertaAbiertaAntesRef = useRef(puertaAbierta);
    useEffect(() => {
        if (tienePuerta && puertaAbierta && !puertaAbiertaAntesRef.current) reproducir("puertaPlacaOBoton");
        puertaAbiertaAntesRef.current = puertaAbierta;
    }, [puertaAbierta, tienePuerta]);

    const puertaConLlaveAntesRef = useRef(puertaConLlaveAbierta);
    useEffect(() => {
        if (tienePuertaConLlave && puertaConLlaveAbierta && !puertaConLlaveAntesRef.current) reproducir("puertaConLlave");
        puertaConLlaveAntesRef.current = puertaConLlaveAbierta;
    }, [puertaConLlaveAbierta, tienePuertaConLlave]);

    const estadoAntesRef = useRef(estado);
    useEffect(() => {
        if (estado === "ganado" && estadoAntesRef.current !== "ganado") reproducir("meta");
        estadoAntesRef.current = estado;
    }, [estado]);
}
