import { useCicloDeFrames } from "../useCicloDeFrames.js";
import { SPRITES_PICKUP } from "./sprites.js";

const MS_POR_FRAME = 200;

// Un pickup de habilidad (fantasma/invulnerabilidad/fuerza) en el tablero.
// Componente propio (no un <img> suelto dentro del .map de Tablero.jsx)
// porque se anima con useCicloDeFrames, y un hook no puede vivir adentro de
// un callback de array — ver CeldaTerreno.jsx, mismo motivo.
export default function Pickup({ tipo, fila, columna }) {
    const sprite = useCicloDeFrames(SPRITES_PICKUP[tipo], MS_POR_FRAME);

    return (
        <img
            src={sprite}
            alt=""
            draggable={false}
            className="tablero-pickup"
            style={{ gridRow: fila + 1, gridColumn: columna + 1 }}
        />
    );
}
