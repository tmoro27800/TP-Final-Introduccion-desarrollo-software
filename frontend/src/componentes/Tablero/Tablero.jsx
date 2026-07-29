import './Tablero.css'

// ----------------------------------------------------------------
// PIEZAS DEL MAPA (referencia completa del diseño del juego).
// A medida que se implementa cada mecánica, se suma acá.
//
//  0  = Espacio libre                 (implementado)
//  1  = Pared sólida                  (implementado)
//  2  = Jugador (posición inicial)    (implementado — se extrae del
//                                       mapa antes de llegar a Tablero,
//                                       ver PrepararNivel.js)
//  3  = Meta                          (implementado)
//  4  = Caja deslizante               (implementado)
//  5  = Modo Fantasma                 (implementado)
//  6  = Pinchos                       (pendiente)
//  7  = Teletransportador             (implementado)
//  8  = Enemigos                      (en discusión)
//  9  = Rayo láser                    (pendiente)
// 10  = Invulnerabilidad              (implementado)
// 11  = Botón                         (pendiente, junto con 12)
// 12  = Puerta                        (pendiente, junto con 11)
// 13  = Lava                          (implementado)
// 14  = Puente temporal               (pendiente)
// 15  = Vacío (muerte instantánea)    (implementado)
// 16  = Llave                         (implementado)
// 17  = Placa de presión (para cajas) (pendiente)
// 18  = Potenciador: destruir caja    (implementado)
// ----------------------------------------------------------------

// terreno: lo que nunca se mueve/consume durante la partida (ver
// motorJuego.js). Cajas/llaves/pickups viajan aparte como arrays de
// posiciones, porque se mueven o se consumen.
const TIPOS_TERRENO = {
  0: 'piso',
  1: 'pared',
  3: 'meta',
  7: 'portal',
  13: 'lava',
  15: 'abismo',
}

const TIPOS_PICKUP = {
  fantasma: 'fantasma',
  invulnerabilidad: 'invulnerabilidad',
  fuerza: 'fuerza',
}

function obtenerTipoTerreno(valor) {
  return TIPOS_TERRENO[valor] ?? 'desconocido'
}

export default function Tablero({ mapa, jugador, cajas = [], llaves = [], pickups = [] }) {
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

  // Tamaño de celda responsivo: un nivel angosto usa el tamaño máximo, uno
  // ancho/alto (como los de prueba, más anchos que una pantalla) achica las
  // celdas proporcionalmente para seguir entrando en la ventana, en vez de
  // desbordarse. Un solo valor para ambos ejes (el más chico de los dos)
  // para que la celda siga siendo cuadrada.
  const porAncho = `((94vw - 2rem) / ${columnas})`
  const porAlto = `((70vh - 230px) / ${filas})`
  const tamanoCelda = `max(14px, min(64px, ${porAncho}, ${porAlto}))`

  return (
    <div
      className="tablero"
      style={{
        gridTemplateColumns: `repeat(${columnas}, ${tamanoCelda})`,
        gridTemplateRows: `repeat(${filas}, ${tamanoCelda})`,
      }}
    >
      {mapa.map((fila, y) =>
        fila.map((valor, x) => (
          <div
            key={`${y}-${x}`}
            className={`tablero-celda tablero-celda--${obtenerTipoTerreno(valor)}`}
            style={{ gridRow: y + 1, gridColumn: x + 1 }}
          />
        ))
      )}

      {llaves.map((llave) => (
        <div
          key={`llave-${llave.fila}-${llave.columna}`}
          className="tablero-llave"
          style={{ gridRow: llave.fila + 1, gridColumn: llave.columna + 1 }}
        />
      ))}

      {pickups.map((pickup) => (
        <div
          key={`pickup-${pickup.fila}-${pickup.columna}`}
          className={`tablero-pickup tablero-pickup--${TIPOS_PICKUP[pickup.tipo] ?? 'desconocido'}`}
          style={{ gridRow: pickup.fila + 1, gridColumn: pickup.columna + 1 }}
        />
      ))}

      {cajas.map((caja) => (
        <div
          key={`caja-${caja.fila}-${caja.columna}`}
          className="tablero-caja"
          style={{ gridRow: caja.fila + 1, gridColumn: caja.columna + 1 }}
        />
      ))}

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
