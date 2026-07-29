// Valores de celda del mapa (acordado con el backend, ver Tablero.jsx para
// la lista completa incluyendo lo que todavía no está implementado).
//
// "terreno" = no cambia durante la partida (piso/pared/meta/lava/vacío/
// teletransportador). "entidad" = vive en estado mutable de React porque se
// mueve o se consume (cajas, llaves, pickups de habilidad). El jugador (2)
// nunca vive en la grilla: se extrae a estado en PrepararNivel.js.
export const PISO = 0;
export const PARED = 1;
export const JUGADOR = 2;
export const META = 3;
export const CAJA = 4;
export const FANTASMA = 5;
export const TELETRANSPORTADOR = 7;
export const INVULNERABILIDAD = 10;
export const LAVA = 13;
export const VACIO = 15;
export const LLAVE = 16;
export const FUERZA = 18;

// Valores que en el mapa crudo representan una entidad parada sobre piso
// (no son terreno en sí — la celda de terreno debajo es PISO).
export const VALORES_ENTIDAD = [JUGADOR, CAJA, FANTASMA, INVULNERABILIDAD, LLAVE, FUERZA];

// Valores de terreno que persisten (no se "pisan y desaparecen" como una
// llave o un pickup).
export const VALORES_TERRENO = [PISO, PARED, META, LAVA, VACIO, TELETRANSPORTADOR];

// Pickups de habilidad: valor de celda -> nombre de habilidad que otorgan.
export const HABILIDAD_POR_PICKUP = {
  [FANTASMA]: "fantasma",
  [INVULNERABILIDAD]: "invulnerabilidad",
  [FUERZA]: "fuerza",
};

export function esPickupDeHabilidad(valor) {
  return valor in HABILIDAD_POR_PICKUP;
}
