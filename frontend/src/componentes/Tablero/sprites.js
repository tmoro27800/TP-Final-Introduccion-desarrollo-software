// Sprites reales del tablero (assets/SpriteCuboMapa/Escenario/), a
// reemplazo del CSS puro que había antes.
//
// 14_Puente0/1.png y 14_PuenteAlerta.png salieron de una IA (PixelLab),
// recortados a mano de una grilla de variaciones que generó — por eso no
// tienen sufijo "-compañero" en el comentario de siempre, son la primera
// mecánica de este proyecto sin arte del compañero.
//
// Ojo con los archivos 12_PuertaPlacaPresion0-8.png: originalmente el
// compañero los subió como "14_PuertaTemporal" (mismo prefijo que
// PUENTE=14, por confusión) — son en realidad la animación de apertura de
// PUERTA (valor 12, la que abren botón/placa de presión), así que se
// renombraron para que el número coincida con el resto de esta carpeta.
import {
    PISO,
    PARED,
    CAJA,
    PINCHOS,
    PLACA_PRESION,
} from "../../juego/Juego/tiposCelda.js";

import piso from "../../assets/SpriteCuboMapa/Escenario/0_Piso.png";
import pared from "../../assets/SpriteCuboMapa/Escenario/1_ParedSolida.png";
import caja from "../../assets/SpriteCuboMapa/Escenario/4_Caja.png";
import pinchos from "../../assets/SpriteCuboMapa/Escenario/6_Pinchos.png";
import placaDeCaja from "../../assets/SpriteCuboMapa/Escenario/17_PlacaDeCaja.png";
import llave from "../../assets/SpriteCuboMapa/Escenario/16_Llave.png";

import puente0 from "../../assets/SpriteCuboMapa/Escenario/14_Puente0.png";
import puente1 from "../../assets/SpriteCuboMapa/Escenario/14_Puente1.png";
import puenteAlerta from "../../assets/SpriteCuboMapa/Escenario/14_PuenteAlerta.png";

import meta0 from "../../assets/SpriteCuboMapa/Escenario/3_Meta0.png";
import meta1 from "../../assets/SpriteCuboMapa/Escenario/3_Meta1.png";
import meta2 from "../../assets/SpriteCuboMapa/Escenario/3_Meta2.png";

import puertaConLlave0 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave0.png";
import puertaConLlave1 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave1.png";
import puertaConLlave2 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave2.png";
import puertaConLlave3 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave3.png";
import puertaConLlave4 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave4.png";
import puertaConLlave5 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave5.png";
import puertaConLlave6 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave6.png";
import puertaConLlave7 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave7.png";
import puertaConLlave8 from "../../assets/SpriteCuboMapa/Escenario/16_PuertaConLlave8.png";

import puertaPlaca0 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion0.png";
import puertaPlaca1 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion1.png";
import puertaPlaca2 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion2.png";
import puertaPlaca3 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion3.png";
import puertaPlaca4 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion4.png";
import puertaPlaca5 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion5.png";
import puertaPlaca6 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion6.png";
import puertaPlaca7 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion7.png";
import puertaPlaca8 from "../../assets/SpriteCuboMapa/Escenario/12_PuertaPlacaPresion8.png";

import invulnerabilidad0 from "../../assets/SpriteCuboMapa/Escenario/10_Invulnerabilidad0.png";
import invulnerabilidad1 from "../../assets/SpriteCuboMapa/Escenario/10_Invulnerabilidad1.png";
import invulnerabilidad2 from "../../assets/SpriteCuboMapa/Escenario/10_Invulnerabilidad2.png";

import vacio0 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio0.png";
import vacio1 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio1.png";
import vacio2 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio2.png";
import vacio3 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio3.png";
import vacio4 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio4.png";
import vacio5 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio5.png";
import vacio6 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio6.png";
import vacio7 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio7.png";
import vacio8 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio8.png";
import vacio9 from "../../assets/SpriteCuboMapa/Escenario/15_Vacio9.png";

import lava0 from "../../assets/SpriteCuboMapa/Escenario/13_Lava0.png";
import lava1 from "../../assets/SpriteCuboMapa/Escenario/13_Lava1.png";
import lava2 from "../../assets/SpriteCuboMapa/Escenario/13_Lava2.png";
import lava3 from "../../assets/SpriteCuboMapa/Escenario/13_Lava3.png";
import lava4 from "../../assets/SpriteCuboMapa/Escenario/13_Lava4.png";
import lava5 from "../../assets/SpriteCuboMapa/Escenario/13_Lava5.png";
import lava6 from "../../assets/SpriteCuboMapa/Escenario/13_Lava6.png";
import lava7 from "../../assets/SpriteCuboMapa/Escenario/13_Lava7.png";
import lava8 from "../../assets/SpriteCuboMapa/Escenario/13_Lava8.png";

import botonSinPresionar from "../../assets/SpriteCuboMapa/Escenario/11_Boton0.png";
import botonPresionado from "../../assets/SpriteCuboMapa/Escenario/11_Boton1.png";

import laserApagado0 from "../../assets/SpriteCuboMapa/Escenario/9_LaserApagado0.png";
import laserApagado1 from "../../assets/SpriteCuboMapa/Escenario/9_LaserApagado1.png";
import laserEncendido0 from "../../assets/SpriteCuboMapa/Escenario/9_LaserEncendido0.png";
import laserEncendido1 from "../../assets/SpriteCuboMapa/Escenario/9_LaserEncendido1.png";

import cajaDestruida0 from "../../assets/SpriteCuboMapa/Escenario/4_CajaDestruida0.png";
import cajaDestruida1 from "../../assets/SpriteCuboMapa/Escenario/4_CajaDestruida1.png";
import cajaDestruida2 from "../../assets/SpriteCuboMapa/Escenario/4_CajaDestruida2.png";
import cajaDestruida3 from "../../assets/SpriteCuboMapa/Escenario/4_CajaDestruida3.png";

import portal0 from "../../assets/SpriteCuboMapa/Escenario/7_Portal0.png";
import portal1 from "../../assets/SpriteCuboMapa/Escenario/7_Portal1.png";
import portal2 from "../../assets/SpriteCuboMapa/Escenario/7_Portal2.png";
import portal3 from "../../assets/SpriteCuboMapa/Escenario/7_Portal3.png";

import fantasma0 from "../../assets/SpriteCuboMapa/Escenario/5_Fantasma0.png";
import fantasma1 from "../../assets/SpriteCuboMapa/Escenario/5_Fantasma1.png";
import fantasma2 from "../../assets/SpriteCuboMapa/Escenario/5_Fantasma2.png";

import fuerza0 from "../../assets/SpriteCuboMapa/Escenario/18_Fuerza0.png";
import fuerza1 from "../../assets/SpriteCuboMapa/Escenario/18_Fuerza1.png";
import fuerza2 from "../../assets/SpriteCuboMapa/Escenario/18_Fuerza2.png";

import powerUpDestruido0 from "../../assets/SpriteCuboMapa/Escenario/PowerUpDestruido0.png";
import powerUpDestruido1 from "../../assets/SpriteCuboMapa/Escenario/PowerUpDestruido1.png";
import powerUpDestruido2 from "../../assets/SpriteCuboMapa/Escenario/PowerUpDestruido2.png";
import powerUpDestruido3 from "../../assets/SpriteCuboMapa/Escenario/PowerUpDestruido3.png";

// terreno estático: un valor de mapa, un sprite fijo. Lava, vacío, meta y
// portal no entran acá porque se animan (ver SPRITES_LAVA/SPRITES_VACIO/
// SPRITES_META/SPRITES_PORTAL) y el botón/láser/puerta con llave tampoco
// porque su sprite depende del estado de la partida (ver SPRITES_BOTON/
// SPRITES_LASER/SPRITES_PUERTA_CON_LLAVE).
export const SPRITES_TERRENO = {
    [PISO]: piso,
    [PARED]: pared,
    [PINCHOS]: pinchos,
    [PLACA_PRESION]: placaDeCaja,
};

// lava, vacío, meta y portal animados — se ciclan con useCicloDeFrames (ver
// CeldaTerreno.jsx)
export const SPRITES_LAVA = [lava0, lava1, lava2, lava3, lava4, lava5, lava6, lava7, lava8];
export const SPRITES_VACIO = [vacio0, vacio1, vacio2, vacio3, vacio4, vacio5, vacio6, vacio7, vacio8, vacio9];
export const SPRITES_META = [meta0, meta1, meta2];
export const SPRITES_PORTAL = [portal0, portal1, portal2, portal3];

// puertas animadas: frame 0 = cerrada. Al desbloquearse reproducen 1-8 UNA
// SOLA VEZ y se quedan en el último — no es un loop como lava/láser, es una
// transición (ver usePuertaAnimada.js). PUERTA se abre con botón o con una
// caja sobre la placa de presión (puertaAbierta en motorJuego.js);
// PUERTA_CON_LLAVE se abre juntando todas las llaves del nivel
// (puertaConLlaveAbierta).
export const SPRITES_PUERTA_PLACA = [
    puertaPlaca0,
    puertaPlaca1,
    puertaPlaca2,
    puertaPlaca3,
    puertaPlaca4,
    puertaPlaca5,
    puertaPlaca6,
    puertaPlaca7,
    puertaPlaca8,
];

export const SPRITES_PUERTA_CON_LLAVE = [
    puertaConLlave0,
    puertaConLlave1,
    puertaConLlave2,
    puertaConLlave3,
    puertaConLlave4,
    puertaConLlave5,
    puertaConLlave6,
    puertaConLlave7,
    puertaConLlave8,
];

// puente: 2 variantes "normales" (se alterna por posición para que una
// fila de 3 celdas no se vea repetida) y una variante "alerta" (grieta
// brillante) para cuando le quedan pocos movimientos antes de colapsar —
// ver avanzarPuentes en motorJuego.js. Colapsado no tiene sprite propio:
// se ve igual que el vacío (SPRITES_VACIO), porque termina siendo lo mismo
// (un agujero, muerte instantánea).
export const SPRITES_PUENTE = [puente0, puente1];
export const SPRITE_PUENTE_ALERTA = puenteAlerta;

// botón: [sin presionar, presionado] — no se anima, es un estado fijo de
// la partida (presionarBoton en motorJuego.js lo deja presionado para
// siempre), no una animación en loop.
export const SPRITES_BOTON = [botonSinPresionar, botonPresionado];

// láser: dos sets de frames (apagado/encendido, ver laserActivo en
// motorJuego.js) — cada set se anima en loop mientras esté en ese estado.
export const SPRITES_LASER = {
    apagado: [laserApagado0, laserApagado1],
    encendido: [laserEncendido0, laserEncendido1],
};

// caja destruida: efecto transitorio de 4 frames (64x64, el doble de un
// tile normal) que se dispara al destruir una caja — ver
// useEfectosDestruccion.js.
export const SPRITES_CAJA_DESTRUIDA = [cajaDestruida0, cajaDestruida1, cajaDestruida2, cajaDestruida3];

// power-up consumido: efecto transitorio de 4 frames (32x32, tamaño de un
// tile normal) que se dispara donde termina el jugador cuando se le
// gasta una habilidad (fantasma al cruzar una pared, invulnerabilidad o
// fuerza al usarse) — ver useEfectoPowerUp.js.
export const SPRITES_POWERUP_DESTRUIDO = [powerUpDestruido0, powerUpDestruido1, powerUpDestruido2, powerUpDestruido3];

// pickups de habilidad, por nombre (ver motorJuego.js: habilidadActiva) —
// cada uno es un array de frames para animarlos con useCicloDeFrames
// (ver Pickup.jsx).
export const SPRITES_PICKUP = {
    fantasma: [fantasma0, fantasma1, fantasma2],
    invulnerabilidad: [invulnerabilidad0, invulnerabilidad1, invulnerabilidad2],
    fuerza: [fuerza0, fuerza1, fuerza2],
};

export const SPRITE_CAJA = caja;
export const SPRITE_LLAVE = llave;
