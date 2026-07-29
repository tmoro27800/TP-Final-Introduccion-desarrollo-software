import { useCicloUnaVez } from "../useCicloDeFrames.js";
import { SPRITES_CAJA_DESTRUIDA } from "./sprites.js";
import { MS_POR_FRAME_CAJA_DESTRUIDA } from "./useEfectosDestruccion.js";

// Estallido de 4 frames al destruir una caja (por Fuerza o empujada al
// vacío). El sprite es 64x64 — el doble de un tile — así que desborda la
// celda a propósito (mismo truco que el viento del personaje en
// Jugador.css). Se anima una sola vez — useCicloUnaVez no vuelve al frame
// 0, y useEfectosDestruccion.js desmonta este componente apenas termina el
// ciclo.
export default function EfectoCajaDestruida({ fila, columna }) {
    const sprite = useCicloUnaVez(SPRITES_CAJA_DESTRUIDA, MS_POR_FRAME_CAJA_DESTRUIDA);

    return (
        <img
            src={sprite}
            alt=""
            draggable={false}
            className="tablero-efecto-destruccion"
            style={{ gridRow: fila + 1, gridColumn: columna + 1 }}
        />
    );
}
