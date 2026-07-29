import { JUGADOR, CAJA, LLAVE, VALORES_ENTIDAD, HABILIDAD_POR_PICKUP, esPickupDeHabilidad, PISO } from "./tiposCelda.js";

// Separa el mapa crudo que manda el backend (un solo valor por celda) en:
// - terreno: la grilla estática (piso/pared/meta/lava/vacío/teletransportador),
//   con toda celda que en realidad es "una entidad parada sobre piso"
//   (jugador/caja/llave/pickup) reemplazada por PISO.
// - las posiciones iniciales de cada entidad, para que motorJuego.js arme el
//   estado mutable de la partida (ver crearEstadoInicial).
//
// Motor y React nunca tocan el mapa crudo de nuevo — todo lo que se mueve o
// se consume durante la partida vive en estado, no en la grilla.
export function prepararNivel(mapaOriginal) {
    if (!Array.isArray(mapaOriginal) || !Array.isArray(mapaOriginal[0])) {
        throw new Error(
            "prepararNivel esperaba una matriz (array de arrays) y recibió: " +
                JSON.stringify(mapaOriginal)
        );
    }

    const jugadorInicial = buscarPrimero(mapaOriginal, JUGADOR) ?? { fila: 1, columna: 1 };
    const cajasIniciales = buscarTodos(mapaOriginal, CAJA);
    const llavesIniciales = buscarTodos(mapaOriginal, LLAVE);
    const pickupsIniciales = buscarPickups(mapaOriginal);

    const terreno = mapaOriginal.map((fila) =>
        fila.map((valor) => (VALORES_ENTIDAD.includes(valor) ? PISO : valor))
    );

    return { terreno, jugadorInicial, cajasIniciales, llavesIniciales, pickupsIniciales };
}

function buscarPrimero(mapa, valorBuscado) {
    for (let fila = 0; fila < mapa.length; fila++) {
        for (let columna = 0; columna < mapa[fila].length; columna++) {
            if (mapa[fila][columna] === valorBuscado) return { fila, columna };
        }
    }
    return null;
}

function buscarTodos(mapa, valorBuscado) {
    const encontrados = [];
    for (let fila = 0; fila < mapa.length; fila++) {
        for (let columna = 0; columna < mapa[fila].length; columna++) {
            if (mapa[fila][columna] === valorBuscado) encontrados.push({ fila, columna });
        }
    }
    return encontrados;
}

function buscarPickups(mapa) {
    const encontrados = [];
    for (let fila = 0; fila < mapa.length; fila++) {
        for (let columna = 0; columna < mapa[fila].length; columna++) {
            const valor = mapa[fila][columna];
            if (esPickupDeHabilidad(valor)) {
                encontrados.push({ fila, columna, tipo: HABILIDAD_POR_PICKUP[valor] });
            }
        }
    }
    return encontrados;
}
