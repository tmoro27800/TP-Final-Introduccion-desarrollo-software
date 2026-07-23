# db/ — capa de acceso a datos

Todas las queries SQL del proyecto viven acá, organizadas por tabla. Ningún
otro archivo del backend (rutas, controladores) debería escribir SQL directo
— siempre pasan por estas funciones.

## Instalación

Parado en la carpeta `backend/`:
```bash
npm install pg dotenv
```

## Estructura

db/
pool.js # conexión a Postgres (pg.Pool)
queries/
index.js # reexporta todo agrupado por tabla
dificultad.queries.js
levels.queries.js
scores.queries.js # incluye el ranking global
pistas.queries.js
powerups.queries.js
pistasUsadas.queries.js
powerupsUsados.queries.js


Las 7 tablas tienen CRUD completo (Create, Read, Update, Delete):

| Tabla | Create | Read | Update | Delete |
|---|---|---|---|---|
| `dificultad` | `createDificultad` | `getAllDificultades`, `getDificultadById` | `updateDificultad` | `deleteDificultad` |
| `levels` | `createLevel` | `getAllLevels`, `getLevelById` | `updateLevel` | `deleteLevel` |
| `scores` | `createScore` | `getAllScores`, `getScoreById`, `getTopScoresByLevel`, `getGlobalRanking` | `updateScore` | `deleteScore` |
| `pistas` | `createPista` | `getPistasByLevel`, `getPistaById` | `updatePista` | `deletePista` |
| `powerups` | `createPowerup` | `getAllPowerups`, `getPowerupById` | `updatePowerup` | `deletePowerup` |
| `pistas_usadas` | `registerPistaUsada` | `getAllPistasUsadas`, `getPistaUsadaById`, `getPistasUsadasByScore` | `updatePistaUsada` | `deletePistaUsada` |
| `powerups_usados` | `registerPowerupUsado` | `getAllPowerupsUsados`, `getPowerupUsadoById`, `getPowerupsUsadosByScore` | `updatePowerupUsado` | `deletePowerupUsado` |

## Por qué está separado así

- **Nunca se concatena texto directo en el SQL** — todas las queries usan
  parámetros (`$1`, `$2`, ...) para evitar SQL injection.
- **Una función = una operación concreta**, así las rutas de Express
  (en `src/routes/`) quedan cortas y legibles, sin SQL mezclado con lógica HTTP.
- **`getGlobalRanking()`** (en `scores.queries.js`) implementa la regla de
  negocio del proyecto con un CTE de Postgres: gana quien llegó más lejos,
  y a igual nivel máximo, quien lo hizo con menos pasos.
- **`pistas_usadas`/`powerups_usados` se enganchan a `scores` (`score_id`)**,
  no a una sesión de juego — se registran recién cuando el nivel se completa
  y el frontend ya tiene el `id` del score creado.

## Probar rápido que la conexión funciona

```js
// test-connection.js
const { dificultad } = require('./db/queries')

dificultad.getAllDificultades()
  .then((rows) => console.log(rows))
  .catch((err) => console.error('Error de conexión:', err.message))
```
```bash
node test-connection.js
