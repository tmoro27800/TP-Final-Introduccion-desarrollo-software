import { useAnimacionJugador } from "./useAnimacionJugador.js";
import "./Jugador.css";

// Todas las capas visuales del personaje: estela (imagen residual de la
// celda anterior, se desvanece), partículas ambiente, viento direccional
// al caminar, y el sprite del cuerpo en sí — de atrás para adelante.
export default function Jugador({ jugador, habilidadActiva, ultimoIntento }) {
    const { spritePersonaje, spriteParticulas, spriteViento, ventoDireccion, spriteEstela, estelas } =
        useAnimacionJugador({ habilidadActiva, ultimoIntento });

    const posicionActual = { gridRow: jugador.fila + 1, gridColumn: jugador.columna + 1 };

    return (
        <>
            {spriteEstela &&
                estelas.map((estela) => (
                    <img
                        key={estela.id}
                        src={spriteEstela}
                        alt=""
                        draggable={false}
                        className="jugador-estela"
                        style={{ gridRow: estela.fila + 1, gridColumn: estela.columna + 1 }}
                    />
                ))}

            {spriteParticulas && (
                <img
                    src={spriteParticulas}
                    alt=""
                    draggable={false}
                    className="jugador-particulas"
                    style={posicionActual}
                />
            )}

            {spriteViento && (
                <img
                    src={spriteViento}
                    alt=""
                    draggable={false}
                    className={`jugador-viento jugador-viento--${ventoDireccion}`}
                    style={posicionActual}
                />
            )}

            {spritePersonaje && (
                <img src={spritePersonaje} alt="" draggable={false} className="tablero-jugador" style={posicionActual} />
            )}
        </>
    );
}
