# Backend — Cube of Stars

API REST en Express + Postgres para el juego de puzzle "Cube of Stars".
Implementa el `API_CONTRACT.md` acordado con el frontend, más algunas
rutas viejas que se mantienen por compatibilidad.

## Instalación y arranque

Parado en la raíz del repo (donde está `docker-compose.yml`):

```bash
docker compose up -d          # levanta Postgres con el esquema de db/init.sql
```

Parado en `backend/`:

```bash
npm install
cp .env.example .env          # los defaults ya coinciden con docker-compose.yml
npm run dev
```

**⚠️ Si ya tenías la base levantada de antes** (con las tablas viejas
`pistas`/`powerups`), Postgres NO va a recrear el esquema solo con hacer
`docker compose up`: los scripts de `docker-entrypoint-initdb.d` (o sea,
`db/init.sql`) sólo corren la primera vez que se crea el volumen de datos.
Como `pistas` se renombró a `consejos` y `powerups` se reemplazó por
`obstaculos` (tabla distinta, no un simple `ALTER TABLE`), hace falta
recrear el volumen para que el nuevo esquema se aplique:

```bash
docker compose down -v        # -v borra también el volumen de Postgres
docker compose up --build     # fuerza reconstrucción + init.sql desde cero
```

Sin ese paso, vas a ver en los logs del contenedor `db` cosas como
`relation "obstaculos" does not exist` o `relation "consejos" does not
exist`: no es que falte una tabla, es que el volumen viejo nunca corrió el
`init.sql` nuevo.

`src/index.js` chequea la conexión a Postgres antes de levantar el
servidor — si falla, imprime en consola qué revisar (`.env`, contenedor
corriendo, base creada).

## Estructura

```
backend/
  src/
    index.js              # entry point: chequea conexión, monta rutas, levanta el server
    db/
      pool.js              # conexión a Postgres (pg.Pool)
      queries/
        index.js           # reexporta todo agrupado por tabla
        dificultad.queries.js
        levels.queries.js   # incluye filtro por dificultad y el shape del contrato
        puntajes.queries.js # queries del API Contract (alias /puntajes), CRUD completo
        consejos.queries.js  # ex "pistas.queries.js"
        obstaculos.queries.js # ex "powerups.queries.js"
    routes/
      index.js             # monta cada sub-router en /api
      dificultad.routes.js
      levels.routes.js
      puntajes.routes.js
      consejos.routes.js    # ex "pistas.routes.js"
      obstaculos.routes.js  # ex "powerups.routes.js"
```

> `pistas.*` y `powerups.*` ya no existen (ni el `/scores` viejo): las
> tablas se renombraron/reemplazaron en `db/init.sql`, así que los archivos
> viejos se borraron para no dejar código apuntando a tablas que no están.

## Modelo de datos

Todas las tablas viven en `db/init.sql`. Las 5 tienen al menos 5 campos
propios (sin contar `id`) y al menos una relación por FK.

| Tabla | Campos propios | Relación (FK) |
|---|---|---|
| `dificultad` | `nombre`, `nombre_visible`, `orden`, `descripcion`, `multiplicador_puntaje` | referenciada por `levels.dificultad_id` y `obstaculos.dificultad_id` |
| `levels` | `name`, `order_index`, `dificultad_id`, `layout`, `created_at` | → `dificultad`; referenciada por `scores.level_id` y `consejos.level_id` |
| `scores` (`/api/puntajes`) | `level_id`, `player_name`, `moves`, `time_seconds`, `completed_at` | → `levels` |
| `consejos` (ex `pistas`) | `level_id`, `texto`, `orden`, `tipo`, `creado_en` | → `levels` |
| `obstaculos` (ex `powerups`) | `nombre`, `nombre_visible`, `descripcion`, `tipo`, `orden`, `dificultad_id` | → `dificultad` |

Reglas de negocio detrás de los campos:
- `dificultad.multiplicador_puntaje`: pondera el puntaje en un futuro ranking global según la dificultad jugada (dificil vale más que normal a igual cantidad de movimientos).
- `consejos.level_id` es `NOT NULL` (a diferencia de la vieja `pistas`): un consejo sin nivel no tiene sentido. Además tiene `UNIQUE (level_id, orden)` para no repetir el número de orden dentro del mismo nivel.
- `consejos.creado_en`: reemplaza al viejo `pistas.veces_usada`. El frontend ahora pide todos los consejos de un nivel juntos (`GET /api/consejos?nivel=`) y los va revelando de a uno del lado del cliente (ver `useConsejos.js`), así que no tiene sentido contar vistas backend-side; en cambio se guarda cuándo se creó el registro.
- `obstaculos` es el glosario de mecánicas del tablero (piso, pared, lava, láser, teletransportador, etc.), una fila por mecánica, para que el modal "Cómo jugar > Mecánicas" del frontend arme su lista con datos reales (ver `mecanicasInfo.js`) en vez de un array hardcodeado. Reemplaza a `powerups`, que nunca se llegó a usar desde el frontend.
- `obstaculos.dificultad_id`: dificultad mínima en la que aparece esa mecánica (`NULL` = aparece en todas).

## Endpoints

Todos bajo `/api`. Dificultades: `normal` y `dificil` (2). Modo libre se descartó.

| Método | Ruta | Estado | Qué hace |
|---|---|---|---|
| GET | `/api/dificultades` | 🟢 canónico | `[{ id: "normal", nombre: "Normal" }, ...]` — `id` es el slug |
| GET/POST/PUT/DELETE | `/api/dificultades/:id` | 🟢 canónico | CRUD completo (incluye `descripcion`, `multiplicador_puntaje`) |
| GET | `/api/niveles` | 🟢 canónico | `[{ id, nombre, dificultad }]` |
| GET | `/api/niveles?dificultad=normal\|dificil` | 🟢 canónico | Igual, filtrado |
| GET/POST/PUT/DELETE | `/api/niveles/:id` | 🟢 canónico | CRUD completo, incluye `mapa` |
| GET | `/api/puntajes?nivel=<id>&dificultad=` | 🟢 canónico | `[{ jugador, movimientos, tiempo }]`, ordenado |
| POST | `/api/puntajes` | 🟢 canónico | Crea un puntaje, valida nivel/dificultad/jugador/movimientos/tiempo |
| GET/PUT/DELETE | `/api/puntajes/:id` | 🟢 canónico | Ver, corregir o borrar un puntaje ya guardado |
| GET | `/api/consejos?nivel=<id>` | 🟢 canónico | Consejos de un nivel, ordenados por `orden` |
| GET/POST/PUT/DELETE | `/api/consejos/:id` | 🟢 canónico | CRUD completo |
| GET | `/api/obstaculos` | 🟢 canónico | Glosario completo, ordenado por `orden` |
| GET/POST/PUT/DELETE | `/api/obstaculos/:id` | 🟢 canónico | CRUD completo |
| * | `/api/dificultad`, `/api/levels` | 🟡 alias viejo | Mismo recurso en inglés, sin las validaciones del contrato. Candidatos a borrar. |

**Validaciones implementadas en `POST`/`PUT /api/puntajes`:**
- `nivel` faltante o inexistente → `400`.
- `dificultad` inexistente, o que no coincide con la dificultad real del nivel → `400`.
- `jugador` vacío o de más de 50 caracteres → `400`.
- `movimientos`/`tiempo` no numéricos o negativos → `400`.

**Formato de error:** siempre `{ "error": "mensaje" }`.

## Por qué está organizado así

- **Nunca se concatena texto directo en el SQL** — todas las queries usan parámetros (`$1`, `$2`, ...).
- **Una función = una operación concreta**, las rutas de Express quedan cortas, sin SQL mezclado con lógica HTTP.

## Pendiente para el equipo

- **Recrear el volumen de Postgres** (`docker compose down -v && docker compose up --build`) en todas las máquinas del equipo — el cambio `pistas→consejos` / `powerups→obstaculos` no se aplica solo.
- **Pantallas de administración en el frontend** para el CRUD de las 5 entidades — el backend ya soporta todo, falta que el frontend lo llame (hoy sólo hace `GET`s de consejos/obstaculos/niveles/dificultades y `POST` de puntajes).
- **Decidir si se borran `/api/dificultad`, `/api/levels`** (alias viejos en inglés) antes de la entrega, para no tener endpoints duplicados en la defensa oral.
