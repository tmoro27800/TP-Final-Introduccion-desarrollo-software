import './Tablero.css'

// ----------------------------------------------------------------
// PIEZAS DEL MAPA (referencia completa del diseño del juego).
// A medida que se implementa cada mecánica, se suma acá.
//
//  0  = Espacio libre                 (implementado)
//  1  = Pared sólida                  (implementado)
//  2  = Jugador (posición inicial)    (implementado — se extrae del
//                                       mapa antes de llegar a Tablero,
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

export default function Tablero({ mapa, jugador }) {
  // sin mapa todavía (ej: mientras el backend responde), mostramos
  // un estado de carga en vez de intentar dibujar algo vacío
  if (!mapa) {
    return (
      <div className="tablero-cargando">
        Cargando mapa...
      </div>
    )
  }

  const filas = mapa.length
  const columnas = mapa[0]?.length ?? 0

  return (
    <div
      className="tablero"
      style={{
        gridTemplateColumns: `repeat(${columnas}, minmax(var(--celda-min), var(--celda-max)))`,
        gridTemplateRows: `repeat(${filas}, minmax(var(--celda-min), var(--celda-max)))`,
      }}
    >
      {mapa.map((fila, y) =>
        fila.map((valor, x) => (
          <div
            key={`${y}-${x}`}
            className={`tablero-celda tablero-celda--${obtenerTipoCelda(valor)}`}
          />
        ))
      )}

      {jugador && (
        <div
          className="tablero-jugador"
          style={{
            gridRow: jugador.fila + 1,
            gridColumn: jugador.columna + 1,
          }}
        />
      )}
    </div>
  )
}