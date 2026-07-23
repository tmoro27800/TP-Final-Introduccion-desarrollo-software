# db/ — capa de acceso a datos

Todas las queries SQL del proyecto viven acá, organizadas por tabla. Ningún
otro archivo del backend (rutas, controladores) debería escribir SQL directo
— siempre pasan por estas funciones.

## Instalación

Parado en la carpeta `backend/`:

```bash
npm install pg dotenv
cp .env.example .env   # ajustá los valores si tu Postgres no usa los defaults
```

## Estructura

```
db/
  pool.js               # conexión a Postgres (pg.Pool)
  queries/
    index.js            # reexporta todo agrupado por tabla
    dificultad.queries.js
    levels.queries.js
    playSessions.queries.js
    scores.queries.js
    pistas.queries.js
    powerups.queries.js
    pistasUsadas.queries.js
    powerupsUsados.queries.js
```

**Las 8 tablas tienen CRUD completo** (Create, Read, Update, Delete), como pide la consigna. Ojo con los nombres: en las tablas de "eventos" del juego, el Create y algunos Updates tienen nombres de negocio en vez de genéricos (`startSession` en vez de `createSession`, `incrementMuertes`/`finishSession` en vez de un `update` genérico) — es el mismo CRUD por debajo, pero con nombres que dicen qué hace cada operación en el contexto del juego. Igual agregamos una versión genérica (`updateSession`, `getAllSessions`, etc.) para que un panel de administración pueda editar cualquier campo a mano si hace falta.

| Tabla | Create | Read | Update | Delete |
|---|---|---|---|---|
| `dificultad` | `createDificultad` | `getAllDificultades`, `getDificultadById` | `updateDificultad` | `deleteDificultad` |
| `levels` | `createLevel` | `getAllLevels`, `getLevelById` | `updateLevel` | `deleteLevel` |
| `play_sessions` | `startSession` | `getAllSessions`, `getSessionById` | `updateSession` (+ `incrementMuertes`, `finishSession`, `invalidateSession`) | `deleteSession` |
| `scores` | `createScore` | `getAllScores`, `getScoreById`, `getTopScoresByLevel`, `getGlobalRanking` | `updateScore` | `deleteScore` |
| `pistas` | `createPista` | `getPistasByLevel` | `updatePista` | `deletePista` |
| `powerups` | `createPowerup` | `getAllPowerups`, `getPowerupById` | `updatePowerup` | `deletePowerup` |
| `pistas_usadas` | `registerPistaUsada` | `getAllPistasUsadas`, `getPistaUsadaById`, `getPistasUsadasBySession` | `updatePistaUsada` | `deletePistaUsada` |
| `powerups_usados` | `registerPowerupUsado` | `getAllPowerupsUsados`, `getPowerupUsadoById`, `getPowerupsUsadosBySession` | `updatePowerupUsado` | `deletePowerupUsado` |

## Cómo se usa desde una ruta de Express

```js
const { levels, scores } = require('../backend-queries/db/queries')

app.get('/levels', async (req, res) => {
  const data = await levels.getAllLevels()
  res.json(data)
})

app.post('/scores', async (req, res) => {
  const { level_id, session_id, player_name, moves, time_seconds } = req.body
  const score = await scores.createScore({ level_id, session_id, player_name, moves, time_seconds })
  res.status(201).json(score)
})

app.get('/ranking', async (req, res) => {
  const data = await scores.getGlobalRanking()
  res.json(data)
})
```

## Por qué está separado así

- **Nunca se concatena texto directo en el SQL** — todas las queries usan
  parámetros (`$1`, `$2`, ...) para evitar SQL injection. Ejemplo de lo que
  **no** hay que hacer nunca: `` `SELECT * FROM scores WHERE player_name = '${nombre}'` ``.
- **Una función = una operación concreta** (`getAllLevels`, `createScore`, etc.),
  así las rutas de Express quedan cortas y legibles, sin SQL mezclado con
  lógica HTTP.
- **`getGlobalRanking()`** (en `scores.queries.js`) implementa la regla de
  negocio del proyecto: gana quien llegó más lejos, y a igual nivel máximo
  alcanzado, quien lo hizo con menos pasos — usando un CTE (`WITH ...`) de
  Postgres en vez de traer todo a JavaScript y calcularlo ahí, que sería
  mucho más lento con muchos jugadores.

## Probar rápido que la conexión funciona

Con Postgres ya corriendo (`docker compose up`), un script sueltito:

```js
// test-connection.js
const { dificultad } = require('./db/queries')

dificultad.getAllDificultades()
  .then((rows) => console.log(rows))
  .catch((err) => console.error('Error de conexión:', err.message))
```

```bash
node test-connection.js
```

Si ves las 3 dificultades impresas, la conexión y las queries andan bien.
