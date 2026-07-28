// Valores de celda del mapa (acordado con el backend, ver Tablero.jsx para
// la lista completa incluyendo lo que todavía no está implementado).
//
// "terreno" = no cambia durante la partida (piso/pared/meta/lava/vacío/
// teletransportador/pinchos/láser/botón/puerta/puente/placa). "entidad" =
// vive en estado mutable de React porque se mueve o se consume (cajas,
// llaves, pickups de habilidad). El jugador (2) nunca vive en la grilla:
// se extrae a estado en PrepararNivel.js.
export const PISO = 0;
export const PARED = 1;
export const JUGADOR = 2;
export const META = 3;
export const CAJA = 4;
export const FANTASMA = 5;
export const PINCHOS = 6;
export const TELETRANSPORTADOR = 7;
export const LASER = 9;
export const INVULNERABILIDAD = 10;
export const BOTON = 11;
export const PUERTA = 12;
export const LAVA = 13;
export const PUENTE = 14;
export const VACIO = 15;
export const LLAVE = 16;
export const PLACA_PRESION = 17;
export const FUERZA = 18;

// Valores que en el mapa crudo representan una entidad parada sobre piso
// (no son terreno en sí — la celda de terreno debajo es PISO).
export const VALORES_ENTIDAD = [JUGADOR, CAJA, FANTASMA, INVULNERABILIDAD, LLAVE, FUERZA];

// Valores de terreno que persisten (no se "pisan y desaparecen" como una
// llave o un pickup). Botón/puerta/puente tienen estado dinámico propio
// (ver motorJuego.js: botonesPresionados, puentes) pero su POSICIÓN en el
// mapa es fija, por eso cuentan como terreno igual que el resto.
export const VALORES_TERRENO = [
  PISO,
  PARED,
  META,
  LAVA,
  VACIO,
  TELETRANSPORTADOR,
  PINCHOS,
  LASER,
  BOTON,
  PUERTA,
  PUENTE,
  PLACA_PRESION,
];

// Pickups de habilidad: valor de celda -> nombre de habilidad que otorgan.
export const HABILIDAD_POR_PICKUP = {
  [FANTASMA]: "fantasma",
  [INVULNERABILIDAD]: "invulnerabilidad",
  [FUERZA]: "fuerza",
};

export function esPickupDeHabilidad(valor) {
  return valor in HABILIDAD_POR_PICKUP;
}
