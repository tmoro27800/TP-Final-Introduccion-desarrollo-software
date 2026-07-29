// Datos de prueba para Puntaje.jsx — permite probar el filtro de
// dificultad + el select de nivel + la tabla de puntajes SIN backend, igual
// que nivelDePrueba.js hace para el motor de juego. Se activa con el toggle
// "Datos de prueba" de la pantalla (debug, no es contenido real).
//
// A propósito, "normal" y "dificil" tienen una CANTIDAD DISTINTA de niveles
// (3 y 2) — así se nota clarito que el <select> se repuebla según el modo
// elegido, y no queda una lista fija pegada de la dificultad anterior.
// IDs en el rango 900+ para no chocar nunca con ids reales de la base.
const NIVELES_MOCK = {
    normal: [
        { id: 901, nombre: "Nivel 1", dificultad: "normal" },
        { id: 902, nombre: "Nivel 2", dificultad: "normal" },
        { id: 903, nombre: "Nivel 3", dificultad: "normal" },
    ],
    dificil: [
        { id: 951, nombre: "Nivel 4", dificultad: "dificil" },
        { id: 952, nombre: "Nivel 5", dificultad: "dificil" },
    ],
};

// Puntajes por nivel — incluye un empate a propósito (mismos movimientos,
// distinto tiempo) para poder comprobar el criterio de desempate del
// ordenamiento (menor tiempo gana).
const PUNTAJES_MOCK = {
    901: [
        { jugador: "Tomi", movimientos: 12, tiempo: 40 },
        { jugador: "Nacho", movimientos: 12, tiempo: 45 },
        { jugador: "Vale", movimientos: 15, tiempo: 30 },
    ],
    902: [
        { jugador: "Sofi", movimientos: 20, tiempo: 55 },
    ],
    903: [], // nivel sin puntajes todavía, para probar el estado vacío
    951: [
        { jugador: "Tomi", movimientos: 30, tiempo: 120 },
        { jugador: "Bruno", movimientos: 28, tiempo: 130 },
    ],
    952: [
        { jugador: "Vale", movimientos: 40, tiempo: 200 },
    ],
};

const DEMORA_MS = 250; // simula latencia de red, para que se vea el estado "cargando"

function demora(valor) {
    return new Promise((resolve) => setTimeout(() => resolve(valor), DEMORA_MS));
}

// Misma firma que getNivelesPorDificultad (nivelServicio.js), para poder
// intercambiarlas sin tocar el resto de Puntaje.jsx.
export const getNivelesPorDificultadMock = async (dificultadId) => {
    return demora(NIVELES_MOCK[dificultadId] ?? []);
};

// Misma firma que getPuntajesPorNivel (puntajeServicio.js).
export const getPuntajesPorNivelMock = async (nivelId) => {
    return demora(PUNTAJES_MOCK[nivelId] ?? []);
};
