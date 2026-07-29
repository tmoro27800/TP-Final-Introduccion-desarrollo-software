import { useCicloUnaVez } from "../useCicloDeFrames.js";
import { SPRITES_POWERUP_DESTRUIDO } from "./sprites.js";
import { MS_POR_FRAME_POWERUP } from "./useEfectoPowerUp.js";

// Destello de 4 frames (32x32, tamaño normal de un tile) en la celda donde
// estaba el pickup, al agarrarlo. Se anima una sola vez — useCicloUnaVez no
// vuelve al frame 0, y useEfectoPowerUp.js desmonta este componente apenas
// termina el ciclo (mismo criterio que EfectoCajaDestruida.jsx).
export default function EfectoPowerUp({ fila, columna }) {
    const sprite = useCicloUnaVez(SPRITES_POWERUP_DESTRUIDO, MS_POR_FRAME_POWERUP);

    return (
        <img
            src={sprite}
            alt=""
            draggable={false}
            className="tablero-efecto-powerup"
            style={{ gridRow: fila + 1, gridColumn: columna + 1 }}
        />
    );
}
