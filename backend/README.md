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

Si la base ya estaba levantada con un esquema viejo (de antes de que
existieran `dificultad`, `consejos` y `obstaculos`), no hay un script de
migración incremental — la forma más simple es recrearla desde cero con
el `db/init.sql` actual (que ya incluye las 5 tablas). **Ojo: esto borra
todos los datos que haya en esa base** (útil en desarrollo, no en una base
con datos reales que quieras conservar):

```bash
docker compose down -v   # baja los contenedores y BORRA el volumen de datos de Postgres
docker compose up -d db  # la vuelve a crear vacía, corriendo init.sql desde cero
```

`src/index.js` chequea la conexión a Postgres antes de levantar el
servidor — si falla, imprime en consola qué revisar (`.env`, contenedor
corriendo, base creada).

### Variables de entorno (`.env`)

| Variable | Default (`.env.example`) | Para qué |
|---|---|---|
| `PORT` | `3000` | Puerto donde escucha Express |
| `DB_HOST` | `localhost` | Host de Postgres (`db` si el backend también corre en Docker, ver `docker-compose.yml`) |
| `DB_PORT` | `5432` | Puerto de Postgres **dentro** de la red de Docker/tu máquina |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `postgres` / `postgres` / `puzzle_game` | Credenciales |

**Ojo con el puerto si conectás un cliente SQL (DBeaver, psql) desde tu
máquina** en vez de desde el backend: `docker-compose.yml` expone Postgres
en el **`5433`** del host (`"5433:5432"`), justamente para no pisar una
instalación de Postgres nativa que ya tengas escuchando en el `5432` de
siempre. El backend (corra en Docker o nativo apuntando a `localhost`)
sigue usando `5432` porque, o bien habla con el contenedor desde *adentro*
de la red de Docker (donde el mapeo de puertos no aplica), o bien apunta a
un Postgres nativo tuyo que sí está en el `5432` de tu máquina.

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
        levels.queries.js  # incluye filtro por dificultad y el shape del contrato
        puntajes.queries.js # queries del API Contract (alias /puntajes), CRUD completo
        consejos.queries.js
        obstaculos.queries.js
    routes/
      index.js             # monta cada sub-router en /api
      dificultad.routes.js
      levels.routes.js
      puntajes.routes.js
      consejos.routes.js
      obstaculos.routes.js
```

## Modelo de datos

Todas las tablas viven en `db/init.sql`. Las 5 tienen al menos 5 campos
propios (sin contar `id`) y al menos una relación por FK.

| Tabla | Campos propios | Relación (FK) |
|---|---|---|
| `dificultad` | `nombre`, `nombre_visible`, `orden`, `descripcion`, `multiplicador_puntaje` | referenciada por `levels.dificultad_id` y `obstaculos.dificultad_id` |
| `levels` | `name`, `order_index`, `dificultad_id`, `layout`, `created_at` | → `dificultad`; referenciada por `scores.level_id` y `consejos.level_id` |
| `scores` | `level_id`, `player_name`, `moves`, `time_seconds`, `completed_at` | → `levels` |
| `consejos` | `level_id`, `texto`, `orden`, `tipo`, `creado_en` | → `levels` (`NOT NULL`) |
| `obstaculos` | `nombre`, `nombre_visible`, `descripcion`, `tipo`, `orden`, `dificultad_id` | → `dificultad` (nullable) |

Reglas de negocio detrás de los campos nuevos:
- `dificultad.multiplicador_puntaje`: pondera el puntaje en un futuro ranking global según la dificultad jugada (dificil vale más que normal a igual cantidad de movimientos).
- `consejos` (antes "pistas") son consejos progresivos por nivel: `orden` define en qué secuencia se revelan — el frontend los pide todos juntos (`GET /api/consejos?nivel=`) y los va mostrando de a uno del lado del cliente (ver `frontend/src/juego/Consejos/useConsejos.js`), así que no hace falta un endpoint de "marcar como visto" ni un contador — por eso `veces_usada` se reemplazó por `creado_en` (se llena solo, mismo criterio que `levels.created_at`). `consejos.tipo` queda reservado para variantes futuras (`resaltado`, `camino`) que hoy no se usan. A diferencia de la vieja `pistas`, `level_id` es `NOT NULL` (un consejo siempre pertenece a un nivel) y hay una restricción `UNIQUE (level_id, orden)` para no cargar dos consejos del mismo nivel con el mismo orden por error.
- `obstaculos` es el glosario de mecánicas del tablero (Lava, Pinchos, Láser, Puerta, etc. — una fila por cada una, ver `db/init.sql`). Reemplaza a la vieja tabla `powerups`, que nunca se llegó a usar desde el frontend. `obstaculos.nombre` es el slug interno (ej. `"lava"`) que el frontend usa para emparejar cada fila con su sprite local (ver `frontend/src/juego/Menu/mecanicasInfo.js`); `obstaculos.dificultad_id` indica la dificultad mínima en la que aparece esa mecánica (`NULL` = aparece en todas, como piso/pared/meta).

## Endpoints

Todos bajo `/api`. Dificultades: `normal` y `dificil` (2). Modo libre se descartó.

| Método | Ruta | Estado | Qué hace |
|---|---|---|---|
| GET | `/api/dificultades` | 🟢 canónico | `[{ id: "normal", nombre: "Normal", descripcion }, ...]` — `id` es el slug. `descripcion` es una extensión aditiva sobre el contrato original, la usa `SeleccionModo.jsx` |
| GET/POST/PUT/DELETE | `/api/dificultades/:id` | 🟢 canónico | CRUD completo (incluye `descripcion`, `multiplicador_puntaje`) |
| GET | `/api/niveles` | 🟢 canónico | `[{ id, nombre, dificultad }]` |
| GET | `/api/niveles?dificultad=normal\|dificil` | 🟢 canónico | Igual, filtrado |
| GET/POST/PUT/DELETE | `/api/niveles/:id` | 🟢 canónico | CRUD completo, incluye `mapa` |
| GET | `/api/puntajes?nivel=<id>&dificultad=` | 🟢 canónico | `[{ jugador, movimientos, tiempo }]`, ordenado |
| POST | `/api/puntajes` | 🟢 canónico | Crea un puntaje, valida nivel/dificultad/jugador/movimientos/tiempo |
| GET/PUT/DELETE | `/api/puntajes/:id` | 🟢 canónico | Ver, corregir o borrar un puntaje ya guardado |
| GET/POST/PUT/DELETE | `/api/consejos` | 🔵 en uso (`Nivel.jsx`) | CRUD completo; `GET /?nivel=<id>` ordenado por `orden`, son los consejos progresivos del botón "💡 Consejos" |
| GET/POST/PUT/DELETE | `/api/obstaculos` | 🔵 en uso (`Menu.jsx`) | CRUD completo; `GET /` ordenado por `orden`, es el glosario "Cómo jugar > Mecánicas" del frontend |
| * | `/api/dificultad`, `/api/levels` | 🟡 alias viejo | Mismo recurso en inglés, sin las validaciones del contrato. Candidatos a borrar. |

> El alias viejo `/api/scores` (y sus archivos `scores.routes.js`/
> `scores.queries.js`) ya se borraron del backend. Si ves referencias a
> `/api/scores`, `getGlobalRanking`, `ranking/global` o `level/:id/top` en
> otro lado del repo (`frontend/src/servicios/puntajeServicio.js` todavía
> las tiene), son restos muertos de esa limpieza — no llaman a nada que
> exista.

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

- **Pantallas de administración en el frontend** para el CRUD de las 5 entidades (alta/edición/borrado de niveles, dificultades, consejos y obstáculos) — el backend ya soporta todo, falta que el frontend lo llame. `obstaculos` y `consejos` ya se leen (`Menu.jsx`/`Nivel.jsx`), pero crear/editar/borrar desde una pantalla de admin sigue pendiente.
- **Decidir si se borran `/levels`, `/dificultad`** (alias viejos, mismo recurso que las rutas canónicas en español) antes de la entrega, para no tener endpoints duplicados en la defensa oral. `/scores` ya se borró — falta limpiar del lado del frontend las funciones muertas que todavía lo llaman (ver nota en `frontend/README.md`).
