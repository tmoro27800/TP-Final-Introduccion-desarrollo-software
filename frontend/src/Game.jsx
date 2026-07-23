import Board from './game/Board.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">PUZZLE//2D</span>
        <span className="app-tag">sistema de niveles &amp; ranking</span> 
      </header>

      <main className="app-stage">
        <Board />
      </main>

      <footer className="app-footer">
        <span>WASD / Flechas — mover</span>
        <span>R — reiniciar nivel</span>
      </footer>
    </div>
  )
}

export default App
