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
    levels.queries.js   # incluye filtro por dificultad y el shape del contrato
    scores.queries.js   # queries "viejas" (alias /scores, en inglés)
    puntajes.queries.js # queries del API Contract (alias /puntajes)
    pistas.queries.js   # fuera del alcance del contrato actual
    powerups.queries.js # fuera del alcance del contrato actual
```

> `pistas_usadas` y `powerups_usados` se eliminaron del proyecto (tabla,
> queries y rutas). Si tu base de datos las tenía creadas, corré
> `db/drop_pistas_powerups_usadas.sql` una vez contra ella.
>
> **Dificultades: `normal` y `dificil` (2). Modo Libre se descartó.** La
> tabla `dificultad` tiene una columna nueva, `nombre_visible`, para el
> texto que se muestra en pantalla ("Normal", "Dificil"), separado del slug
> que viaja por la API (`nombre`). Si tu base tiene el esquema viejo (sin
> esa columna), corré `db/migrar_dificultades.sql`. Si tu base todavía tiene
> las 3 dificultades originales (`Facil`/`Media`/`Dificil`), corré primero
> `db/migrar_a_2_dificultades.sql`.
>
> Como no hay modo libre, `scores` sigue con el mismo diseño de siempre:
> `level_id` obligatorio (todo puntaje pertenece a un nivel), y la
> dificultad se obtiene por join con `levels`/`dificultad` — no hace falta
> ninguna columna extra en `scores`.

Las tablas tienen CRUD (Create, Read, Update, Delete) según haga falta:

| Tabla | Create | Read | Update | Delete |
|---|---|---|---|---|
| `dificultad` | `createDificultad` | `getAllDificultades`, `getAllDificultadesContrato`, `getDificultadById`, `getDificultadByNombre` | `updateDificultad` | `deleteDificultad` |
| `levels` | `createLevel` | `getAllLevels(dificultad?)`, `getLevelById`, `existsLevel` | `updateLevel` | `deleteLevel` |
| `scores` (alias viejo) | `createScore` | `getAllScores`, `getScoresFiltered`, `getScoreById`, `getTopScoresByLevel`, `getGlobalRanking` | `updateScore` | `deleteScore` |
| `scores` vía `puntajes.queries.js` (contrato) | `createPuntaje` | `getPuntajesFiltered({level_id, dificultad_id?})` | — | — |
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
