import './Tablero.css'
import { SPRITE_CAJA, SPRITE_LLAVE } from './sprites.js'
import Jugador from './Jugador.jsx'
import CeldaTerreno from './CeldaTerreno.jsx'
import Pickup from './Pickup.jsx'
import EfectoCajaDestruida from './EfectoCajaDestruida.jsx'
import EfectoPowerUp from './EfectoPowerUp.jsx'
import { useEfectosDestruccion } from './useEfectosDestruccion.js'
import { useEfectoPowerUp } from './useEfectoPowerUp.js'
import { LASER, BOTON, PUERTA, PUENTE, PUERTA_CON_LLAVE } from '../../juego/Juego/tiposCelda.js'
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
//  3  = Meta                          (implementado, sprite animado)
//  4  = Caja deslizante               (implementado, sprite)
//  5  = Modo Fantasma                 (implementado, sprite)
//  6  = Pinchos                       (implementado, sprite)
//  7  = Teletransportador             (implementado, sprite)
//  8  = Enemigos                      (descartado, no se va a implementar)
//  9  = Rayo láser                    (implementado, sprite animado)
// 10  = Invulnerabilidad              (implementado, sprite)
// 11  = Botón                         (implementado, sprite)
// 12  = Puerta                        (implementado, sprite animado)
// 13  = Lava                          (implementado, sprite animado)
// 14  = Puente temporal               (implementado, sprite — 2 variantes +
//                                       alerta; colapsado reusa el sprite
//                                       de vacío)
// 15  = Vacío (muerte instantánea)    (implementado, sprite)
// 16  = Llave                         (implementado, sprite)
// 17  = Placa de presión (para cajas) (implementado, sprite)
// 18  = Potenciador: destruir caja    (implementado, sprite)
// 19  = Puerta con llave              (implementado, sprite animado —
//                                       se desbloquea juntando TODAS las
//                                       llaves del nivel, igual que la meta)
// ----------------------------------------------------------------

function buscarGrupoPuente(puentes, fila, columna) {
  return puentes.find((grupo) => grupo.celdas.some((c) => c.fila === fila && c.columna === columna))
}

// Para las mecánicas cuyo aspecto depende del estado de la partida (láser
// on/off, botón presionado, puerta abierta/cerrada, puente activo/alerta/
// colapsado): calcula qué corresponde mostrar en esta celda puntual.
// CeldaTerreno.jsx recibe el resultado ya resuelto — no necesita saber nada
// de botonesPresionados/puentes/puertaAbierta, solo pintar.
function calcularEstadoCelda(valor, fila, columna, { movimientos, botonesPresionados, puertaAbierta, puertaConLlaveAbierta, puentes }) {
  if (valor === LASER) {
    return { laserEncendido: laserActivo(movimientos) }
  }
  if (valor === BOTON) {
    return { botonPresionado: botonesPresionados.some((b) => b.fila === fila && b.columna === columna) }
  }
  if (valor === PUERTA) {
    return { puertaAbierta }
  }
  if (valor === PUERTA_CON_LLAVE) {
    return { puertaConLlaveAbierta }
  }
  if (valor === PUENTE) {
    // alterna entre las 2 variantes del sprite según la posición, para que
    // una fila de varias celdas de puente no se vea repetida a lo bobo
    const estado = { puenteVariante: (fila + columna) % 2 }
    const grupo = buscarGrupoPuente(puentes, fila, columna)
    if (grupo?.colapsado) return { ...estado, modificador: 'colapsado' }
    if (grupo?.activado && grupo.movimientosRestantes <= 2) return { ...estado, modificador: 'alerta' }
    if (grupo?.activado) return { ...estado, modificador: 'activo' }
    return estado
  }
  return {}
}

export default function Tablero({
  mapa,
  jugador,
  cajas = [],
  llaves = [],
  pickups = [],
  habilidadActiva,
  ultimoIntento,
  ultimoEvento,
  movimientos = 0,
  botonesPresionados = [],
  puentes = [],
  puertaAbierta = false,
  puertaConLlaveAbierta = false,
}) {
  const efectosDestruccion = useEfectosDestruccion(ultimoEvento)
  const efectoPowerUp = useEfectoPowerUp(ultimoEvento)

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
          const posicion = { gridRow: y + 1, gridColumn: x + 1 }
          const estado = calcularEstadoCelda(valor, y, x, {
            movimientos,
            botonesPresionados,
            puertaAbierta,
            puertaConLlaveAbierta,
            puentes,
          })
          return <CeldaTerreno key={`${y}-${x}`} valor={valor} posicion={posicion} {...estado} />
        })
      )}

      {llaves.map((llave) => (
        <img
          key={`llave-${llave.fila}-${llave.columna}`}
          src={SPRITE_LLAVE}
          alt=""
          draggable={false}
          className="tablero-llave"
          style={{ gridRow: llave.fila + 1, gridColumn: llave.columna + 1 }}
        />
      ))}

      {pickups.map((pickup) => (
        <Pickup key={`pickup-${pickup.fila}-${pickup.columna}`} tipo={pickup.tipo} fila={pickup.fila} columna={pickup.columna} />
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

      {efectosDestruccion.map((efecto) => (
        <EfectoCajaDestruida key={efecto.id} fila={efecto.fila} columna={efecto.columna} />
      ))}

      {efectoPowerUp && <EfectoPowerUp key={efectoPowerUp.id} fila={efectoPowerUp.fila} columna={efectoPowerUp.columna} />}

      {jugador && <Jugador jugador={jugador} habilidadActiva={habilidadActiva} ultimoIntento={ultimoIntento} />}
    </div>
  )
}
