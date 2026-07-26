import { GRID } from '../Configuration/constants.js'
import './Board.css'
 
// ----------------------------------------------------------------
// MOCK: esto se va a reemplazar por el mapa que llegue del backend.
// Cada fila del array representa una fila del tablero.
// ----------------------------------------------------------------
const MAPA_INICIAL = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
]
 
// ----------------------------------------------------------------
// PIEZAS DEL MAPA (referencia completa del diseño del juego).
// A medida que se implementa cada mecánica, se suma acá.
//
//  0  = Espacio libre                 (implementado)
//  1  = Pared sólida                  (implementado)
//  2  = Jugador (posición inicial)    (implementado — se extrae del
//                                       mapa antes de llegar a Board,
//                                       ver prepararNivel.js)
//  3  = Meta                          (implementado)
//  4  = Caja deslizante               (pendiente)
//  5  = Modo Fantasma                 (pendiente)
//  6  = Pinchos                       (pendiente)
//  7  = Teletransportador             (pendiente)
//  8  = Enemigos                      (en discusión)
//  9  = Rayo láser                    (pendiente)
// 10  = Invulnerabilidad              (pendiente)
// 11  = Botón                         (pendiente, junto con 12)
// 12  = Puerta                        (pendiente, junto con 11)
// 13  = Lava                          (pendiente)
// 14  = Puente temporal               (pendiente)
// 15  = Vacío (muerte instantánea)    (pendiente)
// 16  = Llave                         (pendiente)
// 17  = Placa de presión (para cajas) (pendiente)
// 18  = Potenciador: destruir caja    (pendiente)
// ----------------------------------------------------------------
 
const TIPOS_CELDA = {
  0: 'vacio',
  1: 'pared',
  3: 'meta',
}
 
function obtenerTipoCelda(valor) {
  return TIPOS_CELDA[valor] ?? 'desconocido'
}

export default function Board({ mapa = MAPA_INICIAL, jugador }) {
  const filas = mapa.length
  const columnas = mapa[0]?.length ?? 0
  console.log("Mapa Actualizado: ", mapa);
  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${columnas}, ${GRID.CELL}px)`,
        gridTemplateRows: `repeat(${filas}, ${GRID.CELL}px)`,
      }}
    >
      {mapa.map((fila, y) =>
        fila.map((valor, x) => (
          <div
            key={`${y}-${x}`}
            className={`board-cell board-cell--${obtenerTipoCelda(valor)}`}
          />
        ))
      )}
 
      {jugador && (
        <div
          className="board-jugador"
          style={{
            gridRow: jugador.fila + 1,
            gridColumn: jugador.columna + 1,
          }}
        />
      )}
    </div>
  )
}
