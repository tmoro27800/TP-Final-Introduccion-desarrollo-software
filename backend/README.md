# Backend — Cube of Stars

API REST en Express + Postgres para el juego de puzzle "Cube of Stars".
La referencia completa de cada endpoint (método, ruta, validaciones,
respuestas) está en [`ENDPOINTS.MD`](../ENDPOINTS.MD) en la raíz del repo.

## Instalación y arranque

Parado en la raíz del repo (donde está `docker-compose.yml`):

```bash
docker compose up -d
```

Parado en `backend/`:

```bash
npm install
cp .env.example .env
npm run dev
```

Los defaults de `.env.example` coinciden con `docker-compose.yml`.

**Si ya tenías la base levantada de antes** (con tablas viejas `pistas`/`powerups`),
Postgres NO recrea el esquema solo con `docker compose up`: `db/init.sql` corre
únicamente la primera vez que se crea el volumen. Como `pistas` se renombró a
`consejos` y `powerups` se reemplazó por `obstaculos`, hay que recrear el volumen:

```bash
docker compose down -v
docker compose up --build
```

Sin ese paso, los logs del contenedor `db` pueden mostrar
`relation "obstaculos" does not exist` o `relation "consejos" does not exist`.

`src/index.js` chequea la conexión a Postgres antes de levantar el servidor.
Si falla, imprime en consola qué revisar (`.env`, contenedor corriendo, base creada).

## Estructura

```
backend/
  src/
    index.js              # entry point: chequea conexión, monta rutas, levanta el server
    db/
      pool.js             # conexión a Postgres (pg.Pool)
      queries/
        index.js          # reexporta todo agrupado por tabla
        dificultad.queries.js
        levels.queries.js
        puntajes.queries.js
        consejos.queries.js
        obstaculos.queries.js
    routes/
      index.js            # monta cada sub-router en /api
      dificultad.routes.js
      levels.routes.js
      puntajes.routes.js
      consejos.routes.js
      obstaculos.routes.js
```


## Modelo de datos

Todas las tablas viven en `db/init.sql`. Las 5 tienen al menos 5 campos propios
(sin contar `id`) y al menos una relación por FK.

| Tabla | Campos propios | Relación (FK) |
|---|---|---|
| `dificultad` | `nombre`, `nombre_visible`, `orden`, `descripcion`, `multiplicador_puntaje` | Referenciada por `levels.dificultad_id` y `obstaculos.dificultad_id` |
| `levels` | `name`, `order_index`, `dificultad_id`, `layout`, `created_at` | → `dificultad`; referenciada por `scores.level_id` y `consejos.level_id` |
| `scores` (expuesta como `/api/puntajes`) | `level_id`, `player_name`, `moves`, `time_seconds`, `completed_at` | → `levels` |
| `consejos` | `level_id`, `texto`, `orden`, `tipo`, `creado_en` | → `levels` |
| `obstaculos` | `nombre`, `nombre_visible`, `descripcion`, `tipo`, `orden`, `dificultad_id` | → `dificultad` (opcional) |

Reglas de negocio:

- `dificultad.multiplicador_puntaje`: pondera el puntaje en un futuro ranking
  global (difícil vale más que normal a igual cantidad de movimientos).
- `consejos.level_id` es `NOT NULL` con `UNIQUE (level_id, orden)`.
- `consejos.creado_en` reemplazó a `pistas.veces_usada`: el frontend revela
  consejos en el cliente, no hay contador server-side.
- `obstaculos` es el glosario de mecánicas para el modal "Cómo jugar > Mecánicas".
  Los pickups del juego (fantasma, fuerza, invulnerabilidad) están en el `layout`
  de cada nivel, no en esta tabla.
- `obstaculos.dificultad_id`: dificultad mínima donde aparece la mecánica
  (`NULL` = en todas).

## Endpoints (resumen)

Todos bajo `/api`. Dificultades: `normal` y `dificil`. Modo libre descartado.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/dificultades` | `[{ id, nombre, descripcion }]` (`id` = slug) |
| GET/POST/PUT/DELETE | `/api/dificultades/:id` | CRUD (PK numérico en GET/PUT/DELETE por id) |
| GET | `/api/niveles` | `[{ id, nombre, dificultad }]` |
| GET | `/api/niveles?dificultad=normal\|dificil` | Listado filtrado |
| GET/POST/PUT/DELETE | `/api/niveles/:id` | CRUD, incluye `mapa` en GET |
| GET | `/api/puntajes?nivel=<id>&dificultad=` | Tabla de puntajes ordenada |
| POST | `/api/puntajes` | Guarda resultado de partida |
| GET/PUT/DELETE | `/api/puntajes/:id` | Ver, corregir o borrar un puntaje |
| GET | `/api/consejos?nivel=<id>` | Consejos de un nivel por `orden` |
| GET/POST/PUT/DELETE | `/api/consejos/:id` | CRUD completo |
| GET | `/api/obstaculos` | Glosario completo por `orden` |
| GET/POST/PUT/DELETE | `/api/obstaculos/:id` | CRUD completo |
| * | `/api/dificultad`, `/api/levels` | Alias en inglés del mismo router |

Detalle función por función, validaciones y ejemplos de respuesta:
[`ENDPOINTS.MD`](../ENDPOINTS.MD).

**Validaciones destacadas en `POST`/`PUT /api/puntajes`:**

- `nivel` faltante o inexistente → `400`.
- `dificultad` inexistente o que no coincide con la del nivel → `400`.
- `jugador` vacío o de más de 50 caracteres → `400`.
- `movimientos`/`tiempo` no enteros o negativos → `400`.

**Formato de error:** `{ "error": "mensaje" }`.

## Por qué está organizado así

- **Nunca se concatena texto en el SQL.** Todas las queries usan parámetros (`$1`, `$2`, ...).
- **Una función = una operación concreta.** Las rutas de Express quedan cortas, sin SQL mezclado con lógica HTTP.

