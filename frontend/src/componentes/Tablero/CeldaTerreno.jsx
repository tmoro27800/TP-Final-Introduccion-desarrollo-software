import { useCicloDeFrames } from "../useCicloDeFrames.js";
import { usePuertaAnimada } from "./usePuertaAnimada.js";
import { LASER, LAVA, VACIO, BOTON, META, TELETRANSPORTADOR, PUERTA, PUERTA_CON_LLAVE, PUENTE, PINCHOS, PISO } from "../../juego/Juego/tiposCelda.js";
import {
    SPRITES_TERRENO,
    SPRITES_LAVA,
    SPRITES_VACIO,
    SPRITES_META,
    SPRITES_PORTAL,
    SPRITES_BOTON,
    SPRITES_LASER,
    SPRITES_PUERTA_PLACA,
    SPRITES_PUERTA_CON_LLAVE,
    SPRITES_PUENTE,
    SPRITE_PUENTE_ALERTA,
} from "./sprites.js";
import { CLASES_SIN_SPRITE } from "./celdaVisual.js";

const MS_POR_FRAME_LAVA = 180;
const MS_POR_FRAME_VACIO = 180;
const MS_POR_FRAME_META = 250;
const MS_POR_FRAME_LASER = 220;
const MS_POR_FRAME_PORTAL = 150;
const SIN_ANIMAR = [null]; // frames "vacíos" para no romper las reglas de hooks cuando no aplica

// Una celda de terreno del tablero. Vive en su propio componente (no una
// función suelta adentro del .map de Tablero.jsx) porque lava, vacío, meta,
// láser, portal y las dos puertas se animan con hooks propios, y un hook
// no puede llamarse condicionalmente ni adentro de un callback de array —
// cada celda necesita ser su propia instancia de componente para tener su
// propio estado de animación.
export default function CeldaTerreno({
    valor,
    posicion,
    laserEncendido,
    botonPresionado,
    puertaAbierta,
    puertaConLlaveAbierta,
    puenteVariante,
    modificador,
}) {
    // el puente colapsado se ve como lava (mismo criterio que la lava real,
    // no como el vacío) — de ahí el "|| modificador === 'colapsado'". Pisarlo
    // sigue matando siempre (sin excepción de invulnerabilidad), igual que
    // antes con el vacío: es solo un cambio visual, ver manejarPuente en
    // motorJuego.js.
    const spriteLava = useCicloDeFrames(
        valor === LAVA || (valor === PUENTE && modificador === "colapsado") ? SPRITES_LAVA : SIN_ANIMAR,
        MS_POR_FRAME_LAVA
    );
    const spriteVacio = useCicloDeFrames(valor === VACIO ? SPRITES_VACIO : SIN_ANIMAR, MS_POR_FRAME_VACIO);
    const spriteMeta = useCicloDeFrames(valor === META ? SPRITES_META : SIN_ANIMAR, MS_POR_FRAME_META);
    const spriteLaser = useCicloDeFrames(
        valor === LASER ? (laserEncendido ? SPRITES_LASER.encendido : SPRITES_LASER.apagado) : SIN_ANIMAR,
        MS_POR_FRAME_LASER
    );
    const spritePortal = useCicloDeFrames(valor === TELETRANSPORTADOR ? SPRITES_PORTAL : SIN_ANIMAR, MS_POR_FRAME_PORTAL);
    const spritePuerta = usePuertaAnimada(SPRITES_PUERTA_PLACA, valor === PUERTA && !!puertaAbierta);
    const spritePuertaConLlave = usePuertaAnimada(SPRITES_PUERTA_CON_LLAVE, valor === PUERTA_CON_LLAVE && !!puertaConLlaveAbierta);

    if (valor === LASER) {
        return <img src={spriteLaser} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === LAVA) {
        return <img src={spriteLava} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === VACIO) {
        return <img src={spriteVacio} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === META) {
        return <img src={spriteMeta} alt="" draggable={false} className="tablero-celda tablero-celda--meta" style={posicion} />;
    }

    if (valor === TELETRANSPORTADOR) {
        return <img src={spritePortal} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === PUERTA) {
        return <img src={spritePuerta} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === PUERTA_CON_LLAVE) {
        return <img src={spritePuertaConLlave} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === PUENTE) {
        if (modificador === "colapsado") {
            return <img src={spriteLava} alt="" draggable={false} className="tablero-celda" style={posicion} />;
        }
        if (modificador === "alerta") {
            return (
                <img
                    src={SPRITE_PUENTE_ALERTA}
                    alt=""
                    draggable={false}
                    className="tablero-celda tablero-celda--puente-alerta"
                    style={posicion}
                />
            );
        }
        return <img src={SPRITES_PUENTE[puenteVariante]} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    if (valor === BOTON) {
        return (
            <img
                src={SPRITES_BOTON[botonPresionado ? 1 : 0]}
                alt=""
                draggable={false}
                className="tablero-celda"
                style={posicion}
            />
        );
    }

    // Pinchos: el sprite (6_Pinchos.png) es mayormente transparente — son
    // solo los 3-4 pinchitos, no un tile completo — así que sin nada debajo
    // se veía el fondo oscuro de la página a través suyo en vez de piso.
    // Se dibuja el piso primero y los pinchos encima, mismo criterio que el
    // cubo+efecto del personaje (Jugador.jsx).
    if (valor === PINCHOS) {
        return (
            <>
                <img src={SPRITES_TERRENO[PISO]} alt="" draggable={false} className="tablero-celda" style={posicion} />
                <img src={SPRITES_TERRENO[PINCHOS]} alt="" draggable={false} className="tablero-celda" style={posicion} />
            </>
        );
    }

    const sprite = SPRITES_TERRENO[valor];
    if (sprite) {
        return <img src={sprite} alt="" draggable={false} className="tablero-celda" style={posicion} />;
    }

    const claseSinSprite = CLASES_SIN_SPRITE[valor];
    if (!claseSinSprite) {
        // valor sin sprite Y sin CSS propio (mecánica realmente no
        // implementada): patrón rayado, para detectar rápido si al mapa se
        // le coló un número sin manejar.
        return <div className="tablero-celda tablero-celda--desconocido" style={posicion} />;
    }

    return (
        <div
            className={`tablero-celda tablero-celda--${claseSinSprite}${
                modificador ? ` tablero-celda--${claseSinSprite}--${modificador}` : ""
            }`}
            style={posicion}
        />
    );
}
