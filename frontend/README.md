# Puzzle 2D — Frontend

Base del frontend: **React puro + CSS Grid + Vite** (sin Phaser ni canvas —
el tablero se renderiza con divs, cada celda es un elemento del DOM).

## Cómo correrlo

```bash
npm install
cp .env.example .env   # ajustá VITE_API_URL cuando el backend esté levantado
npm run dev
```

Abre en `http://localhost:5173`. Deberías ver un tablero con grilla y el texto
"MOTOR LISTO" — eso confirma que el layout con CSS Grid está funcionando.

## Estructura

```
src/
  main.jsx          # entry point de React
  App.jsx           # layout general (header / tablero / footer)
  index.css         # paleta y fondo con grilla
  game/
    constants.js     # tamaño de celda y dimensiones del tablero (GRID)
    Board.jsx         # tablero renderizado con CSS Grid (divs)
    Board.css         # estilos del tablero
  api/
    client.js         # wrapper de fetch para hablar con el backend
```

## Por qué así

- **Cada celda es un `<div>`** posicionado con `display: grid`, no hay canvas
  ni loop de renderizado manual — para un puzzle por casillas (sin física,
  sin rotaciones) alcanza y sobra, y es mucho más simple de debuggear con
  las devtools del navegador.
- **`GRID` en `constants.js`** centraliza el tamaño de celda/tablero — el
  motor de movimiento (próximo paso) va a usar esos mismos valores para que
  el jugador se mueva celda por celda, sin diagonales.
- **Cada elemento del juego (jugador, cajas, trampas) va a ser su propio
  componente React**, posicionado con `gridColumn`/`gridRow` según su
  posición en el estado — mover algo es simplemente actualizar ese estado,
  React se encarga de repintar.
- **`api/client.js`** ya está listo para que cuando armemos login/registro y
  el ranking, solo haya que llamar `api.post('/auth/login', {...})`, etc.
  La URL base sale de `VITE_API_URL` así no hay que tocar código para
  apuntar a otro backend (local, staging, producción).

## Próximos pasos

1. Pantallas de login/registro (React, fuera del canvas de Phaser).
2. Motor del juego: movimiento en grilla (WASD/flechas), carga de niveles
   desde un JSON, detección de victoria, contador de pasos y cronómetro.
3. Conectar `api/client.js` con los endpoints reales de auth, puntajes y
   ranking.
