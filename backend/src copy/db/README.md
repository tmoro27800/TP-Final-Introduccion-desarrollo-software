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

```
db/
  pool.js               # conexión a Postgres (pg.Pool)
  queries/
    index.js            # reexporta todo agrupado por tabla
    dificultad.queries.js
    levels.queries.js   # incluye filtro por dificultad
    scores.queries.js   # incluye el ranking global y el filtro combinado
    pistas.queries.js
    powerups.queries.js
```

> `pistas_usadas` y `powerups_usados` se eliminaron del proyecto (tabla,
> queries y rutas). Si tu base de datos las tenía creadas, corré
> `db/drop_pistas_powerups_usadas.sql` una vez contra ella.
>
> Las dificultades quedaron definidas como `normal`/`dificil` (2, no 3). Si
> tu base tiene las 3 viejas (`Facil`/`Media`/`Dificil`), corré
> `db/migrar_a_2_dificultades.sql` una vez.

Las 5 tablas restantes tienen CRUD completo (Create, Read, Update, Delete):

| Tabla | Create | Read | Update | Delete |
|---|---|---|---|---|
| `dificultad` | `createDificultad` | `getAllDificultades`, `getDificultadById` | `updateDificultad` | `deleteDificultad` |
| `levels` | `createLevel` | `getAllLevels(dificultadId?)`, `getLevelById` | `updateLevel` | `deleteLevel` |
| `scores` | `createScore` | `getAllScores`, `getScoresFiltered({level_id, dificultad_id})`, `getScoreById`, `getTopScoresByLevel`, `getGlobalRanking` | `updateScore` | `deleteScore` |
| `pistas` | `createPista` | `getAllPistas`, `getPistasByLevel`, `getPistaById` | `updatePista` | `deletePista` |
| `powerups` | `createPowerup` | `getAllPowerups`, `getPowerupById` | `updatePowerup` | `deletePowerup` |

## Por qué está separado así

- **Nunca se concatena texto directo en el SQL** — todas las queries usan
  parámetros (`$1`, `$2`, ...) para evitar SQL injection.
- **Una función = una operación concreta**, así las rutas de Express
  (en `src/routes/`) quedan cortas y legibles, sin SQL mezclado con lógica HTTP.
- **`getGlobalRanking()`** (en `scores.queries.js`) implementa la regla de
  negocio del proyecto con un CTE de Postgres: gana quien llegó más lejos,
  y a igual nivel máximo, quien lo hizo con menos pasos.

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
```
