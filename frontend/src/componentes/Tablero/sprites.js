// Sprites reales del tablero (assets/SpriteCuboMapa/Escenario/), a
// reemplazo del CSS puro que había antes. Todavía sin animar los que
// tienen varios frames (3_Meta, 5_Fantasma, 7_Portal, 18_Fuerza) — usamos
// el frame base y dejamos la animación cuadro a cuadro para una pasada
// aparte. La llave (16) todavía no tiene sprite del compañero, sigue en
// CSS (ver Tablero.css .tablero-llave) hasta que llegue.
import { PISO, PARED, META, CAJA, FANTASMA, TELETRANSPORTADOR, INVULNERABILIDAD, LAVA, VACIO, FUERZA } from "../../juego/Juego/tiposCelda.js";

import piso from "../../assets/SpriteCuboMapa/Escenario/0_Piso.png";
import pared from "../../assets/SpriteCuboMapa/Escenario/1_ParedSolida.png";
import meta from "../../assets/SpriteCuboMapa/Escenario/3_Meta0.png";
import lava from "../../assets/SpriteCuboMapa/Escenario/13_Lava.png";
import vacio from "../../assets/SpriteCuboMapa/Escenario/15_Vacio.png";
import portal from "../../assets/SpriteCuboMapa/Escenario/7_Portal.png";
import caja from "../../assets/SpriteCuboMapa/Escenario/4_Caja.png";
import fantasma from "../../assets/SpriteCuboMapa/Escenario/5_Fantasma0.png";
import invulnerabilidad from "../../assets/SpriteCuboMapa/Escenario/10_Invulnerabilidad.png";
import fuerza from "../../assets/SpriteCuboMapa/Escenario/18_Fuerza0.png";

// terreno: piso/pared/meta/lava/vacío/portal — un valor de mapa, un sprite.
export const SPRITES_TERRENO = {
    [PISO]: piso,
    [PARED]: pared,
    [META]: meta,
    [LAVA]: lava,
    [VACIO]: vacio,
    [TELETRANSPORTADOR]: portal,
};

// pickups de habilidad, por nombre (ver motorJuego.js: habilidadActiva)
export const SPRITES_PICKUP = {
    fantasma,
    invulnerabilidad,
    fuerza,
};

export const SPRITE_CAJA = caja;
