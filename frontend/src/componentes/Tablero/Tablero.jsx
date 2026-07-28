import './Tablero.css'
import { SPRITES_TERRENO, SPRITES_PICKUP, SPRITE_CAJA } from './sprites.js'
import Jugador from './Jugador.jsx'
import { PINCHOS, LASER, BOTON, PUERTA, PUENTE, PLACA_PRESION } from '../../juego/Juego/tiposCelda.js'
import { laserActivo } from '../../juego/Juego/motorJuego.js'

// ----------------------------------------------------------------
// PIEZAS DEL MAPA (referencia completa del diseño del juego).
// A medida que se implementa cada mecánica, se suma acá.
//
//  0  = Espacio libre                 (implementado, sprite)
//  1  = Pared sólida                  (implementado, sprite)
//  2  = Jugador (posición inicial)    (implementado — se extrae del
//                                       mapa antes de llegar a Tablero,
//                                       ver PrepararNivel.js)
//  3  = Meta                          (implementado, sprite)
//  4  = Caja deslizante               (implementado, sprite)
//  5  = Modo Fantasma                 (implementado, sprite)
//  6  = Pinchos                       (implementado, CSS — sin sprite todavía)
//  7  = Teletransportador             (implementado, sprite)
//  8  = Enemigos                      (descartado, no se va a implementar)
//  9  = Rayo láser                    (implementado, CSS — sin sprite todavía)
// 10  = Invulnerabilidad              (implementado, sprite)
// 11  = Botón                         (implementado, CSS — sin sprite todavía)
// 12  = Puerta                        (implementado, CSS — sin sprite todavía)
// 13  = Lava                          (implementado, sprite)
// 14  = Puente temporal               (implementado, CSS — sin sprite todavía)
// 15  = Vacío (muerte instantánea)    (implementado, sprite)
// 16  = Llave                         (implementado, CSS — sin sprite todavía)
// 17  = Placa de presión (para cajas) (implementado, CSS — sin sprite todavía)
// 18  = Potenciador: destruir caja    (implementado, sprite)
// ----------------------------------------------------------------

// Mecánicas sin sprite del compañero todavía: se dibujan con una clase CSS
// propia (ver Tablero.css) en vez de <img>, para que cada una se distinga a
// simple vista de "desconocido" real (un valor de mapa que no maneja nada).
export const CLASES_SIN_SPRITE = {
  [PINCHOS]: 'pinchos',
  [LASER]: 'laser',
  [BOTON]: 'boton',
  [PUERTA]: 'puerta',
  [PUENTE]: 'puente',
  [PLACA_PRESION]: 'placa',
}

function buscarGrupoPuente(puentes, fila, columna) {
  return puentes.find((grupo) => grupo.celdas.some((c) => c.fila === fila && c.columna === columna))
}

export default function Tablero({
  mapa,
  jugador,
  cajas = [],
  llaves = [],
  pickups = [],
  habilidadActiva,
  ultimoIntento,
  movimientos = 0,
  botonesPresionados = [],
  puentes = [],
  puertaAbierta = false,
}) {
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
        fila.map((valor, x) => {
          const sprite = SPRITES_TERRENO[valor]
          const posicion = { gridRow: y + 1, gridColumn: x + 1 }

          if (sprite) {
            return (
              <img
                key={`${y}-${x}`}
                src={sprite}
                alt=""
                draggable={false}
                className={`tablero-celda${valor === 3 ? ' tablero-celda--meta' : ''}`}
                style={posicion}
              />
            )
          }

          const claseSinSprite = CLASES_SIN_SPRITE[valor]
          if (!claseSinSprite) {
            // valor sin sprite Y sin CSS propio (mecánica realmente no
            // implementada): patrón rayado, para detectar rápido si al
            // mapa se le coló un número sin manejar.
            return <div key={`${y}-${x}`} className="tablero-celda tablero-celda--desconocido" style={posicion} />
          }

          let modificador = ''
          if (valor === LASER) {
            modificador = laserActivo(movimientos) ? 'laser-activo' : 'laser-apagado'
          } else if (valor === BOTON) {
            modificador = botonesPresionados.some((b) => b.fila === y && b.columna === x) ? 'presionado' : ''
          } else if (valor === PUERTA) {
            modificador = puertaAbierta ? 'abierta' : 'cerrada'
          } else if (valor === PLACA_PRESION) {
            modificador = cajas.some((c) => c.fila === y && c.columna === x) ? 'activada' : ''
          } else if (valor === PUENTE) {
            const grupo = buscarGrupoPuente(puentes, y, x)
            if (grupo?.colapsado) modificador = 'colapsado'
            else if (grupo?.activado && grupo.movimientosRestantes <= 2) modificador = 'alerta'
            else if (grupo?.activado) modificador = 'activo'
          }

          return (
            <div
              key={`${y}-${x}`}
              className={`tablero-celda tablero-celda--${claseSinSprite}${modificador ? ` tablero-celda--${claseSinSprite}--${modificador}` : ''}`}
              style={posicion}
            />
          )
        })
      )}

      {llaves.map((llave) => (
        <div
          key={`llave-${llave.fila}-${llave.columna}`}
          className="tablero-llave"
          style={{ gridRow: llave.fila + 1, gridColumn: llave.columna + 1 }}
        />
      ))}

      {pickups.map((pickup) => (
        <img
          key={`pickup-${pickup.fila}-${pickup.columna}`}
          src={SPRITES_PICKUP[pickup.tipo]}
          alt=""
          draggable={false}
          className="tablero-pickup"
          style={{ gridRow: pickup.fila + 1, gridColumn: pickup.columna + 1 }}
        />
      ))}

      {cajas.map((caja) => (
        <img
          key={`caja-${caja.fila}-${caja.columna}`}
          src={SPRITE_CAJA}
          alt=""
          draggable={false}
          className="tablero-caja"
          style={{ gridRow: caja.fila + 1, gridColumn: caja.columna + 1 }}
        />
      ))}

      {jugador && <Jugador jugador={jugador} habilidadActiva={habilidadActiva} ultimoIntento={ultimoIntento} />}
    </div>
  )
}
