import {
  PISO,
  PARED,
  META,
  CAJA,
  FANTASMA,
  PINCHOS,
  TELETRANSPORTADOR,
  LASER,
  INVULNERABILIDAD,
  BOTON,
  PUERTA,
  LAVA,
  PUENTE,
  VACIO,
  LLAVE,
  PLACA_PRESION,
  FUERZA,
  PUERTA_CON_LLAVE,
  HABILIDAD_POR_PICKUP,
} from "../Juego/tiposCelda.js";
import {
  SPRITES_TERRENO,
  SPRITES_PICKUP,
  SPRITE_CAJA,
  SPRITE_LLAVE,
  SPRITES_LAVA,
  SPRITES_VACIO,
  SPRITES_META,
  SPRITES_PORTAL,
  SPRITES_BOTON,
  SPRITES_LASER,
  SPRITES_PUERTA_PLACA,
  SPRITES_PUERTA_CON_LLAVE,
  SPRITES_PUENTE,
} from "../../componentes/Tablero/sprites.js";
import { CLASES_SIN_SPRITE } from "../../componentes/Tablero/celdaVisual.js";

// El texto (nombre/descripción) de cada mecánica ahora sale de la tabla
// `obstaculos` del backend (ver servicios/obstaculoServicio.js) — antes
// estaba hardcodeado en un array acá mismo. El SPRITE sigue siendo cosa
// del frontend (son assets empaquetados, no tiene sentido moverlos a la
// base), así que hace falta este mapa para pasar del slug que manda el
// backend (obstaculo.nombre, ej. "lava") al valor numérico de celda que
// entiende resolverVisual() (ver tiposCelda.js).
export const NOMBRE_A_VALOR = {
  piso: PISO,
  pared: PARED,
  meta: META,
  caja: CAJA,
  llave: LLAVE,
  fantasma: FANTASMA,
  invulnerabilidad: INVULNERABILIDAD,
  fuerza: FUERZA,
  pinchos: PINCHOS,
  lava: LAVA,
  vacio: VACIO,
  teletransportador: TELETRANSPORTADOR,
  laser: LASER,
  boton: BOTON,
  puerta: PUERTA,
  placa_presion: PLACA_PRESION,
  puente: PUENTE,
  puerta_con_llave: PUERTA_CON_LLAVE,
};

// Resuelve cómo dibujar cada mecánica en la lista: sprite real si ya lo
// tenemos (mismo criterio que usa CeldaTerreno.jsx en el tablero), si no el
// placeholder CSS. Así el día que llegue un sprite nuevo aparece acá solo,
// sin tocar este archivo. Láser/botón/lava/puertas tienen más de un estado
// visual en el juego real — acá se muestra el más representativo de cada
// uno (frame 0 = cerrada, para las puertas).
export function resolverVisual(valor) {
  if (valor === CAJA) return { tipo: "img", src: SPRITE_CAJA };
  if (valor === LLAVE) return { tipo: "img", src: SPRITE_LLAVE };
  if (valor in HABILIDAD_POR_PICKUP) return { tipo: "img", src: SPRITES_PICKUP[HABILIDAD_POR_PICKUP[valor]][0] };
  if (valor === LAVA) return { tipo: "img", src: SPRITES_LAVA[0] };
  if (valor === VACIO) return { tipo: "img", src: SPRITES_VACIO[0] };
  if (valor === META) return { tipo: "img", src: SPRITES_META[0] };
  if (valor === TELETRANSPORTADOR) return { tipo: "img", src: SPRITES_PORTAL[0] };
  if (valor === BOTON) return { tipo: "img", src: SPRITES_BOTON[0] };
  if (valor === LASER) return { tipo: "img", src: SPRITES_LASER.encendido[0] };
  if (valor === PUERTA) return { tipo: "img", src: SPRITES_PUERTA_PLACA[0] };
  if (valor === PUERTA_CON_LLAVE) return { tipo: "img", src: SPRITES_PUERTA_CON_LLAVE[0] };
  if (valor === PUENTE) return { tipo: "img", src: SPRITES_PUENTE[0] };
  if (SPRITES_TERRENO[valor]) return { tipo: "img", src: SPRITES_TERRENO[valor] };

  const clase = CLASES_SIN_SPRITE[valor];
  if (clase) return { tipo: "css", clase };

  return null;
}

// Convierte una fila de la tabla obstaculos (ver servicios/obstaculoServicio.js)
// en el shape que espera el render de Menu.jsx: { valor, nombre, descripcion }.
// Ya viene ordenada por "orden" desde el backend.
export function obstaculoAMecanica(obstaculo) {
  return {
    valor: NOMBRE_A_VALOR[obstaculo.nombre],
    nombre: obstaculo.nombre_visible,
    descripcion: obstaculo.descripcion,
  };
}
