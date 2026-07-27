// Nivel hardcodeado (no viene del backend) para poder probar el motor de
// juego completo sin depender de que la base de datos esté levantada. Se
// usa navegando a /juego/test (ver Juego.jsx). Expone cada mecánica nueva
// en una "estación" separada a lo largo de un pasillo, más gauntlet de QA
// que puzzle — la idea es poder probar las 8 mecánicas de una sola pasada.
//
// Mismo layout que el INSERT de prueba en db/init.sql, para que haya
// contenido real usando estas mecánicas una vez que la base esté arriba.
//
// Valores: 0 piso, 1 pared, 2 jugador, 3 meta, 4 caja, 5 fantasma,
// 7 teletransportador, 10 invulnerabilidad, 13 lava, 15 vacío, 16 llave,
// 18 fuerza (ver tiposCelda.js).
//
// Recorrido esperado (de izquierda a derecha):
//   llave -> empujar caja (y bordear por arriba, la caja no se puede pasar
//   de largo) -> atravesar una pared con fantasma -> cruzar lava con
//   invulnerabilidad -> destruir una caja con fuerza -> teletransportador
//   (A a B) -> meta.
// Al costado del pasillo hay dos desvíos opcionales para probar las
// mecánicas letales sin arriesgar el progreso: un pozo de lava (arriba,
// col 13) y un pozo de vacío (abajo, col 20) matan y reinician el nivel;
// otro desvío (abajo, col 21) deja empujar una caja al vacío para ver que
// se destruye sin matar al jugador.
const MAPA_DE_PRUEBA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 16, 0, 4, 0, 1, 5, 1, 0, 10, 13, 0, 18, 4, 0, 7, 0, 7, 0, 0, 0, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 15, 4, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 15, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const nivelDePrueba = {
    id: "test",
    nombre: "Nivel de prueba (todas las mecánicas)",
    dificultad: "dificil",
    mapa: MAPA_DE_PRUEBA,
};
