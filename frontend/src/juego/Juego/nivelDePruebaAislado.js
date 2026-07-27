// Nivel de debug tipo "hub": un pasillo horizontal (fila 1) con una cabina
// vertical por mecánica, cada una independiente de las demás — a diferencia
// de nivelDePrueba.js (que encadena todo en un solo recorrido), acá cada
// mecánica se prueba sola, sin depender de que las anteriores hayan salido
// bien. Útil para encontrar en qué mecánica puntual falla algo.
//
// Importante: la habilidad activa (fantasma/invulnerabilidad/fuerza) es
// estado GLOBAL del motor, no algo por cabina — si entrás a la cabina de
// fantasma y no llegás a usarlo, y después bajás a la cabina de "lava sin
// invulnerabilidad", vas a seguir teniendo fantasma activo (no invulnerabilidad,
// así que igual morís, pero por las dudas: apretá R antes de probar cada
// cabina para arrancar siempre desde cero).
//
// Recorrido por columna (fila 1 = pasillo, bajando con S/flecha abajo se
// entra a cada cabina):
//   col 3  -> empujar una caja
//   col 5  -> atravesar una pared con fantasma
//   col 7  -> teletransportador (A -> B)
//   col 10 -> cruzar lava con invulnerabilidad
//   col 12 -> pisar lava SIN invulnerabilidad (muerte)
//   col 14 -> pisar el vacío (muerte)
//   col 16 -> llave + meta (gana el nivel)
//   col 18 -> destruir una caja con fuerza
//   col 20 -> empujar una caja al vacío (se destruye sin matar)
const MAPA_AISLADO = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 4, 1, 5, 1, 0, 1, 1, 10, 1, 13, 1, 15, 1, 16, 1, 18, 1, 4, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 7, 1, 1, 13, 1, 1, 1, 1, 1, 3, 1, 4, 1, 15, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 7, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const nivelDePruebaAislado = {
    id: "test-aislado",
    nombre: "Nivel de prueba (mecánicas aisladas)",
    dificultad: "dificil",
    mapa: MAPA_AISLADO,
};
