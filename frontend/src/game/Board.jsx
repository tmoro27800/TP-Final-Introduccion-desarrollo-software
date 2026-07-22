import { GRID } from './constants.js'
import './Board.css'

export default function Board() {
  const cells = Array.from({ length: GRID.COLS * GRID.ROWS })

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${GRID.COLS}, ${GRID.CELL}px)`,
        gridTemplateRows: `repeat(${GRID.ROWS}, ${GRID.CELL}px)`,
      }}
    >
      {cells.map((_, i) => (
        <div key={i} className="board-cell" />
      ))}

      <div className="board-overlay">
        <span className="board-overlay-title">MOTOR LISTO</span>
        <span className="board-overlay-sub">próximo paso: movimiento y niveles</span>
      </div>
    </div>
  )
}
