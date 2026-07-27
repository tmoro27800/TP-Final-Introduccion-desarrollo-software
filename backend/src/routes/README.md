# routes/ — endpoints REST

Cada archivo expone rutas de Express usando las queries de `db/queries/`.
`routes/index.js` las junta todas.

## Instalación

Si todavía no tenés Express y CORS instalados en `backend/`:
```bash
npm install express cors
```

## Cómo conectarlo a tu servidor

```js
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', require('./routes'))

app.listen(3000, () => console.log('Backend escuchando en el puerto 3000'))
```

## Endpoints del API Contract (Cube of Stars) — los que hay que usar

Todos bajo `/api`. **Dificultades: `normal` y `dificil` (2). "Modo Libre" se
descartó** — no hay ranking sin nivel, todo puntaje pertenece siempre a un
nivel puntual.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/dificultades` | `[{ id: "normal", nombre: "Normal" }, { id: "dificil", nombre: "Dificil" }]` — `id` es el slug, no el PK numérico |
| GET | `/api/niveles` | `[{ id, nombre, dificultad }]` — sin `mapa` |
| GET | `/api/niveles?dificultad=normal\|dificil` | Igual, filtrado por dificultad (nombre, no id) |
| GET | `/api/niveles/:id` | `{ id, nombre, dificultad, mapa }` — `mapa` es la matriz (0=piso,1=pared,2=jugador,3=meta) |
| GET | `/api/puntajes?nivel=<id>&dificultad=normal\|dificil` | `[{ jugador, movimientos, tiempo }]`, ordenado por menor movimientos y luego menor tiempo. `nivel` es obligatorio (no hay modo libre); `dificultad` es un chequeo extra opcional |
| POST | `/api/puntajes` | Body: `{ nivel, dificultad, jugador, movimientos, tiempo }`. `nivel` y `dificultad` son obligatorios y tienen que ser consistentes entre sí (la dificultad tiene que ser la del nivel). Responde `201` con el registro creado |

Validaciones ya implementadas en `GET`/`POST /api/puntajes` (respondían "a definir" en el contrato):
- `nivel` faltante o inexistente → `400`.
- `dificultad` inexistente, o que no coincide con la dificultad real del nivel → `400`.
- `jugador` vacío o de más de 50 caracteres (límite de la columna) → `400`.
- `movimientos`/`tiempo` no numéricos o negativos → `400`.

## Endpoints viejos (alias, no forman parte del contrato)

`/dificultad`, `/levels`, `/scores` siguen andando (mismo comportamiento de
siempre, en inglés/con nombres viejos) por si algo del frontend todavía les
pega. No los uses para código nuevo — son candidatos a borrar una vez que
todo el frontend termine de migrar a `/dificultades`, `/niveles` y `/puntajes`.

`/pistas` y `/powerups` también siguen existiendo, pero **quedaron fuera del
API Contract actual** — el documento del equipo no las menciona. Si ya no
están en el alcance de esta versión, avisen para sacarlas del todo (tablas
incluidas); si van a volver más adelante, no hace falta tocar nada.

## Cómo quedó resuelto lo que el contrato dejaba "a definir"

- **IDs**: para `dificultad` es un string (el slug). Para `niveles` y
  `puntajes` es el id numérico de Postgres.
- **camelCase vs snake_case**: los campos de cara al frontend son los que
  pide el contrato (`nombre`, `dificultad`, `mapa`, `jugador`, `movimientos`,
  `tiempo`) — snake_case solo se usa puertas adentro (columnas de Postgres).
- **Formato de error**: siempre `{ "error": "mensaje" }`, con el status
  code correspondiente (400 validación, 404 no encontrado, 500 error de
  servidor).
- **`POST /api/puntajes`**: responde `201` con el registro creado.
- **Nivel bloqueado/disponible**: no se implementó — no hay sistema de
  login, así que no aplica por ahora (como el propio contrato sugería).

## Todavía sin resolver / pendiente para el equipo

- **El frontend no está conectado a estos endpoints todavía.** `Game.jsx`,
  `SelectionLevel.jsx` y `Score.jsx` siguen llamando a las funciones
  `*Mock` (`getLevelByIdMock`, `getLevelsByDifficultyMock`, y un array
  `PUNTAJES_MOCK` hardcodeado) en vez de a `levelService`/`scoresService`
  reales. Aunque el backend ya cumple el contrato, en pantalla no se va a
  notar nada hasta que alguien cambie esos imports por las versiones que le
  pegan a la API de verdad.
- **El mock `PUNTAJES_MOCK` de `Score.jsx` todavía usa `"facil"`/`"libre"`**
  como valores de dificultad (de un diseño anterior, con 3 modos). Ya no
  corresponden — las dos dificultades reales son `"normal"`/`"dificil"`.
  Hay que actualizar ese mock (o, mejor, borrarlo del todo una vez que
  `Score.jsx` llame a la API real).
- `services/scoresService.js`, `levelService.js` y `dificultadService.js`
  todavía apuntan a las rutas viejas en inglés (`/scores`, con
  `level_id`/`player_name`/`moves`/`time_seconds`) — hay que agregar
  versiones que usen `/puntajes` con los nombres de campo del contrato
  (`nivel`/`jugador`/`movimientos`/`tiempo`), o reescribir las que hay.
