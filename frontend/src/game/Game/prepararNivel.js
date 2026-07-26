// Busca la celda marcada con 2 (jugador) en el mapa crudo que viene
// del backend/mock, y la reemplaza por piso libre (0) — porque la
// posición del jugador va a vivir en estado de React, no en el mapa.
export function prepararNivel(mapaOriginal) {
    const jugadorInicial = buscarJugador(mapaOriginal);
 
    const mapa = mapaOriginal.map((fila, y) =>
        fila.map((valor, x) => {
            const esCeldaDelJugador =
                jugadorInicial && y === jugadorInicial.fila && x === jugadorInicial.columna;
            return esCeldaDelJugador ? 0 : valor;
        })
    );
 
    return { mapa, jugadorInicial: jugadorInicial ?? { fila: 1, columna: 1 } };
}
 
function buscarJugador(mapa) {
    for (let fila = 0; fila < mapa.length; fila++) {
        for (let columna = 0; columna < mapa[fila].length; columna++) {
            if (mapa[fila][columna] === 2) {
                return { fila, columna };
            }
        }
    }
    return null; // el mapa no tenía un 2 — se usa el fallback {1,1}
}
 