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

// Orden pensado para leerse como un recorrido: lo básico primero, después
// los pickups, los peligros estáticos, el portal, y por último las
// mecánicas interactivas más nuevas.
export const MECANICAS = [
  { valor: PISO, nombre: "Piso", descripcion: "Espacio libre. Se camina sin restricciones." },
  { valor: PARED, nombre: "Pared", descripcion: "Bloquea el paso. Con Fantasma activo se puede atravesar una." },
  {
    valor: META,
    nombre: "Meta",
    descripcion: "Objetivo del nivel. No se puede pisar si todavía quedan llaves sin recoger.",
  },
  {
    valor: CAJA,
    nombre: "Caja",
    descripcion: "Se empuja moviéndose contra ella. No se puede empujar sobre otra caja ni sobre un obstáculo sólido.",
  },
  { valor: LLAVE, nombre: "Llave", descripcion: "Se recoge al pisarla. Hacen falta todas para poder pisar la meta." },
  {
    valor: FANTASMA,
    nombre: "Modo fantasma",
    descripcion: "Pickup. El siguiente paso puede atravesar una pared, si la celda de después es transitable.",
  },
  {
    valor: INVULNERABILIDAD,
    nombre: "Invulnerabilidad",
    descripcion: "Pickup. Protege de morir en el próximo peligro (lava o pinchos); se consume al usarse.",
  },
  {
    valor: FUERZA,
    nombre: "Modo fuerza",
    descripcion: "Pickup. El siguiente choque contra una caja la destruye en vez de empujarla.",
  },
  {
    valor: PINCHOS,
    nombre: "Pinchos",
    descripcion: "No matan. Pisarlos suma 3 movimientos al contador, salvo con Invulnerabilidad activa.",
  },
  { valor: LAVA, nombre: "Lava", descripcion: "Mata al pisarla, salvo con Invulnerabilidad activa." },
  {
    valor: VACIO,
    nombre: "Vacío",
    descripcion: "Muerte instantánea al pisarlo. Si se empuja una caja adentro, la caja se destruye pero se avanza.",
  },
  {
    valor: TELETRANSPORTADOR,
    nombre: "Teletransportador",
    descripcion: "Siempre hay dos en el mapa. Pisar uno manda directo al otro.",
  },
  {
    valor: LASER,
    nombre: "Rayo láser",
    descripcion: "Cicla prendido/apagado cada 3 movimientos. Si está prendido al entrar, mata sin excepción.",
  },
  {
    valor: BOTON,
    nombre: "Botón",
    descripcion: "Al tocarlo queda presionado para siempre y abre todas las puertas del nivel.",
  },
  {
    valor: PUERTA,
    nombre: "Puerta",
    descripcion: "Bloquea el paso hasta que se presione algún botón o una caja quede sobre una placa de presión.",
  },
  {
    valor: PLACA_PRESION,
    nombre: "Placa de presión",
    descripcion: "Se activa con el peso de una caja (no con el jugador). Abre puertas mientras la caja siga encima.",
  },
  {
    valor: PUENTE,
    nombre: "Puente temporal",
    descripcion: "Al pisarlo por primera vez arranca una cuenta regresiva de 5 movimientos antes de colapsar.",
  },
  {
    valor: PUERTA_CON_LLAVE,
    nombre: "Puerta con llave",
    descripcion: "Se desbloquea al juntar todas las llaves del nivel, con una animación de apertura.",
  },
];
