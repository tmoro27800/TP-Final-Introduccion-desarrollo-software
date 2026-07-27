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

Si la base ya estaba levantada con un esquema viejo (sin los campos nuevos
de `dificultad`, `pistas` y `powerups`), correr una vez la migración en vez
de recrear todo:

```bash
docker exec -i <nombre_contenedor_db> psql -U postgres -d puzzle_game < ../db/agregar_campos_dificultad.sql
```

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
        levels.queries.js  # incluye filtro por dificultad y el shape del contrato
        scores.queries.js  # queries "viejas" (alias /scores, en inglés)
        puntajes.queries.js # queries del API Contract (alias /puntajes), CRUD completo
        pistas.queries.js
        powerups.queries.js
    routes/
      index.js             # monta cada sub-router en /api
      dificultad.routes.js
      levels.routes.js
      scores.routes.js
      puntajes.routes.js
      pistas.routes.js
      powerups.routes.js
```

## Modelo de datos

Todas las tablas viven en `db/init.sql`. Las 5 tienen al menos 5 campos
propios (sin contar `id`) y al menos una relación por FK.

| Tabla | Campos propios | Relación (FK) |
|---|---|---|
| `dificultad` | `nombre`, `nombre_visible`, `orden`, `descripcion`, `multiplicador_puntaje` | referenciada por `levels.dificultad_id` y `powerups.dificultad_id` |
| `levels` | `name`, `order_index`, `dificultad_id`, `layout`, `created_at` | → `dificultad`; referenciada por `scores.level_id` y `pistas.level_id` |
| `scores` | `level_id`, `player_name`, `moves`, `time_seconds`, `completed_at` | → `levels` |
| `pistas` | `level_id`, `texto`, `orden`, `tipo`, `veces_usada` | → `levels` |
| `powerups` | `nombre`, `descripcion`, `tipo`, `valor`, `dificultad_id` | → `dificultad` |

Reglas de negocio detrás de los campos nuevos:
- `dificultad.multiplicador_puntaje`: pondera el puntaje en un futuro ranking global según la dificultad jugada (dificil vale más que normal a igual cantidad de movimientos).
- `pistas.tipo`: indica cómo tiene que renderizar la pista el frontend (`texto`, `resaltado`, `camino`).
- `pistas.veces_usada`: contador real, se incrementa en `GET /api/pistas/:id` cada vez que un jugador pide ver esa pista puntual — no se edita a mano desde el CRUD de administración.
- `powerups.dificultad_id`: a qué dificultad pertenece el powerup (`NULL` = disponible en todas).

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
| GET/POST/PUT/DELETE | `/api/pistas` | 🔵 en uso | CRUD completo; `GET /:id` incrementa `veces_usada` |
| GET/POST/PUT/DELETE | `/api/powerups` | 🔵 en uso | CRUD completo |
| * | `/api/dificultad`, `/api/levels`, `/api/scores` | 🟡 alias viejo | Mismo recurso en inglés, sin las validaciones del contrato. Candidatos a borrar. |

**Validaciones implementadas en `POST`/`PUT /api/puntajes`:**
- `nivel` faltante o inexistente → `400`.
- `dificultad` inexistente, o que no coincide con la dificultad real del nivel → `400`.
- `jugador` vacío o de más de 50 caracteres → `400`.
- `movimientos`/`tiempo` no numéricos o negativos → `400`.

**Formato de error:** siempre `{ "error": "mensaje" }`.

## Por qué está organizado así

- **Nunca se concatena texto directo en el SQL** — todas las queries usan parámetros (`$1`, `$2`, ...).
- **Una función = una operación concreta**, las rutas de Express quedan cortas, sin SQL mezclado con lógica HTTP.
- **`getGlobalRanking()`** (en `scores.queries.js`) implementa la regla de negocio del ranking con un CTE: gana quien llegó más lejos, y a igual nivel máximo, quien lo hizo con menos pasos.

## Pendiente para el equipo

- **Pantallas de administración en el frontend** para el CRUD de las 5 entidades (alta/edición/borrado de niveles, dificultades, pistas y powerups) — el backend ya soporta todo, falta que el frontend lo llame.
- **Integrar pistas/powerups al gameplay real** (botón "ver pista" en `Juego.jsx`, uso de powerups durante la partida).
- **Decidir si se borran `/scores`, `/levels`, `/dificultad`** (alias viejos, mismo recurso que las rutas canónicas en español) antes de la entrega, para no tener endpoints duplicados en la defensa oral.
