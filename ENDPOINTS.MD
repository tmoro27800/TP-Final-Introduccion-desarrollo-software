# Documentación de endpoints — `backend/src/routes/`

Este documento detalla, archivo por archivo, cada endpoint expuesto por el
backend: método HTTP, ruta, objetivo, función de `db/queries/` que invoca,
parámetros, validaciones y respuestas posibles. Es el detalle "función por
función" que complementa a `routes/README.md` (que da la vista rápida en
tabla) y a `API_CONTRACT.md` (que es el contrato acordado con el frontend).

**Convención de estado** usada en cada sección:
- 🟢 **Canónico** — implementa el API Contract, es la ruta que debe usar el frontend.
- 🟡 **Alias viejo** — mismo recurso, nombres en inglés, se mantiene por compatibilidad. No usar en código nuevo.
- ⚪ **Fuera de contrato** — funciona, pero el API Contract actual no lo pide. El equipo tiene que decidir si se queda o se corta.

---

## `dificultad.routes.js` — montado en `/dificultad` 🟡 y `/dificultades` 🟢

Archivo: `backend/src/routes/dificultad.routes.js`
Queries usadas: `backend/src/db/queries/dificultad.queries.js`

### `GET /`
- **Objetivo:** poblar el selector de dificultad del frontend (pantalla de selección de nivel).
- **Función invocada:** `dificultad.getAllDificultadesContrato()`
- **Parámetros:** ninguno.
- **Validaciones:** ninguna.
- **Respuesta:**
  - `200` → `[{ id: "normal", nombre: "Normal" }, { id: "dificil", nombre: "Dificil" }]`. Nota: `id` es el *slug* (string), no el PK numérico de Postgres — así lo pide el contrato para poder filtrar cruzado sin transformar nada en el frontend.
  - `500` → `{ error: mensaje }`.

### `GET /:id`
- **Objetivo:** consultar una dificultad puntual por su id.
- **Función invocada:** `dificultad.getDificultadById(id)`
- **Parámetros:** `id` (path) — PK numérico interno (no el slug).
- **Validaciones:** ninguna explícita; si no existe, 404.
- **Respuesta:**
  - `200` → `{ id, nombre, nombre_visible, orden }`.
  - `404` → `{ error: "No encontrado" }`.
  - `500` → `{ error: mensaje }`.

### `POST /`
- **Objetivo:** crear una dificultad nueva (uso administrativo/seed, no lo llama el frontend del juego).
- **Función invocada:** `dificultad.createDificultad({ nombre, nombre_visible, orden })`
- **Parámetros (body):** `nombre`, `nombre_visible`, `orden`.
- **Validaciones:** ninguna (no chequea duplicados de `nombre`, aunque la columna es `UNIQUE` en la DB — un choque de unicidad cae al `catch` genérico como `500`, no como `400`).
- **Respuesta:** `201` con el registro creado, o `500` en error.

### `PUT /:id`
- **Objetivo:** editar una dificultad existente.
- **Función invocada:** `dificultad.updateDificultad(id, { nombre, nombre_visible, orden })`
- **Parámetros:** `id` (path), `nombre`/`nombre_visible`/`orden` (body).
- **Validaciones:** ninguna. Si el `id` no existe, 404.
- **Respuesta:** `200` con el registro actualizado, `404` si no existe, `500` en error.

### `DELETE /:id`
- **Objetivo:** borrar una dificultad.
- **Función invocada:** `dificultad.deleteDificultad(id)`
- **Riesgo:** `levels.dificultad_id` referencia esta tabla sin `ON DELETE CASCADE` ni `ON DELETE SET NULL` explícito en `init.sql` — borrar una dificultad que todavía tiene niveles asociados puede fallar por FK constraint y devolver `500` con el mensaje crudo de Postgres, no un `400` amigable.
- **Respuesta:** `204` sin body si se borró, `404` si no existía, `500` en error (incluido el caso de FK constraint).

---

## `levels.routes.js` — montado en `/levels` 🟡 y `/niveles` 🟢

Archivo: `backend/src/routes/levels.routes.js`
Queries usadas: `backend/src/db/queries/levels.queries.js`

Incluye una función local `esLayoutValido(layout)` (no es un endpoint, es un
helper de validación) que chequea que `layout` sea un array de arrays de
enteros antes de guardar.

### `GET /`
- **Objetivo:** listado de niveles para la pantalla de selección de nivel (nombre + dificultad, sin el mapa completo).
- **Función invocada:** `levels.getAllLevels(dificultad?)`
- **Parámetros (query):** `dificultad` (opcional) — slug (`normal`/`dificil`), case-insensitive.
- **Validaciones:** ninguna — si el slug no matchea ninguna dificultad, simplemente devuelve lista vacía (no es un error).
- **Respuesta:** `200` → `[{ id, nombre, dificultad }]`, `500` en error.

### `GET /:id`
- **Objetivo:** traer mapa y datos de un nivel puntual para jugarlo (`Game.jsx`/`Nivel.jsx`).
- **Función invocada:** `levels.getLevelById(id)`
- **Respuesta:** `200` → `{ id, nombre, dificultad, mapa }` (mapa = matriz 0=piso/1=pared/2=jugador/3=meta), `404` si no existe, `500` en error.

### `POST /`
- **Objetivo:** crear un nivel nuevo (carga de niveles, no lo llama el jugador).
- **Función invocada:** `levels.createLevel({ name, order_index, dificultad_id, layout })`
- **Parámetros (body):** `name`, `order_index`, `dificultad_id`, `layout`.
- **Validaciones:** `esLayoutValido(layout)` — si `layout` no es una matriz de enteros, `400` antes de tocar la DB. No valida que `dificultad_id` exista de verdad (un id inválido cae en `500` por FK constraint, no `400`).
- **Respuesta:** `201` con el nivel creado, `400` si el layout es inválido, `500` en error.

### `PUT /:id`
- **Objetivo:** editar un nivel existente.
- **Función invocada:** `levels.updateLevel(id, { name, order_index, dificultad_id, layout })`
- **Validaciones:** `esLayoutValido(layout)` solo si `layout !== undefined` (permite actualizar sin tocar el mapa).
- **Respuesta:** `200` actualizado, `400` layout inválido, `404` no existe, `500` error.

### `DELETE /:id`
- **Objetivo:** borrar un nivel.
- **Función invocada:** `levels.deleteLevel(id)`
- **Nota:** `scores.level_id` sí tiene `ON DELETE CASCADE` en `init.sql` — borrar un nivel borra en cascada todos sus puntajes. Es un comportamiento intencional pero destructivo, vale la pena tenerlo presente antes de usar este endpoint en niveles con puntajes reales.
- **Respuesta:** `204` sin body, `404` no existe, `500` error.

---

## `scores.routes.js` — montado en `/scores` 🟡 (alias viejo, no forma parte del contrato)

Archivo: `backend/src/routes/scores.routes.js`
Queries usadas: `backend/src/db/queries/scores.queries.js`

Duplica en inglés lo que `puntajes.routes.js` hace en español sobre la
misma tabla `scores`. Candidato a eliminar una vez que el frontend
termine de migrar (ver `routes/README.md`).

### `GET /ranking/global`
- **Objetivo:** ranking global de jugadores: gana quien llegó más lejos (mayor `order_index` de nivel alcanzado), y a igual nivel máximo, quien lo hizo con menos movimientos. Regla de negocio del documento del proyecto.
- **Función invocada:** `scores.getGlobalRanking(limit)`
- **Parámetros (query):** `limit` (opcional, default `20`).
- **Nota de orden de rutas:** está declarada *antes* de `GET /:id` a propósito, para que Express no interprete `"ranking"` como un `:id`.
- **Respuesta:** `200` → `[{ player_name, max_nivel, mejores_pasos }]`, `500` error.

### `GET /level/:level_id/top`
- **Objetivo:** mejores puntajes (por movimientos y tiempo) de un nivel puntual.
- **Función invocada:** `scores.getTopScoresByLevel(level_id, limit)`
- **Parámetros:** `level_id` (path), `limit` (query, opcional, default `10`).
- **Respuesta:** `200` → `[{ player_name, moves, time_seconds, completed_at }]`, `500` error.

### `GET /`
- **Objetivo:** todos los puntajes, o filtrados por nivel/dificultad.
- **Función invocada:** `scores.getScoresFiltered({ level_id, dificultad })` si hay query params, si no `scores.getAllScores()`.
- **Parámetros (query):** `nivel` (level_id), `dificultad` (nombre, no id) — ambos opcionales e independientes.
- **Respuesta:** `200` → array de scores completos (`id, level_id, player_name, moves, time_seconds, completed_at`), `500` error.

### `GET /:id`
- **Objetivo:** un puntaje puntual por id.
- **Función invocada:** `scores.getScoreById(id)`
- **Respuesta:** `200`, `404` no encontrado, `500` error.

### `POST /`
- **Objetivo:** guardar un puntaje nuevo (versión vieja, sin validaciones — comparar con `POST /api/puntajes` que sí valida todo).
- **Función invocada:** `scores.createScore({ level_id, player_name, moves, time_seconds })`
- **Validaciones:** **ninguna.** No chequea que `level_id` exista, no valida longitud de `player_name` ni que `moves`/`time_seconds` sean números no negativos. Cualquier error de tipo/constraint cae como `500` genérico.
- **Respuesta:** `201` con el score creado, `500` error.

### `PUT /:id` / `DELETE /:id`
- Análogos a los de niveles/dificultad: actualizar o borrar un score por id, sin validaciones extra. `200`/`404`/`500` y `204`/`404`/`500` respectivamente.

---

## `puntajes.routes.js` — montado en `/puntajes` 🟢 (canónico, API Contract)

Archivo: `backend/src/routes/puntajes.routes.js`
Queries usadas: `puntajes.queries.js` + `dificultad.queries.js` + `levels.queries.js` (para las validaciones cruzadas)

Es la versión "seria" de `scores.routes.js`: mismos datos, pero con los
nombres de campo del contrato y validación completa. Define
`JUGADOR_MAX_LEN = 50` (igual al `VARCHAR(50)` de `player_name` en la DB).

### `GET /`
- **Objetivo:** tabla de puntajes de un nivel + dificultad específicos, para `Score.jsx`.
- **Función invocada:** `puntajes.getPuntajesFiltered({ level_id, dificultad_id })`
- **Parámetros (query):** `nivel` (**obligatorio**), `dificultad` (opcional, nombre no id).
- **Validaciones:**
  1. Si falta `nivel` → `400`.
  2. Si `nivel` no corresponde a un nivel real (`levels.getLevelById`) → `400`.
  3. Si viene `dificultad`, tiene que existir (`dificultad.getDificultadByNombre`) → si no, `400`.
  4. Si `dificultad` no coincide con la dificultad real del nivel → `400` (evita pedir "nivel 3, dificultad fácil" si el nivel 3 es difícil).
- **Respuesta:** `200` → `[{ jugador, movimientos, tiempo }]`, `400` en cualquiera de las 4 validaciones, `500` error.

### `POST /`
- **Objetivo:** guardar el resultado de una partida recién completada.
- **Función invocada:** `puntajes.createPuntaje({ level_id, player_name, moves, time_seconds })`
- **Parámetros (body):** `nivel`, `dificultad`, `jugador`, `movimientos`, `tiempo` (nombres del contrato, no `level_id`/`player_name`/etc.).
- **Validaciones** (en orden, corta en la primera que falla):
  1. `nivel` obligatorio y tiene que existir.
  2. `dificultad` obligatoria, tiene que existir, y tiene que coincidir con la del nivel.
  3. `jugador`: se hace `trim()`, no puede quedar vacío, máximo `JUGADOR_MAX_LEN` (50) caracteres.
  4. `movimientos`: entero, `>= 0`.
  5. `tiempo`: entero, `>= 0` (segundos).
- **Respuesta:** `201` con el registro creado (`{ id, nivel, jugador, movimientos, tiempo, completed_at }` — columnas renombradas en el SQL vía `AS`), `400` en cualquier validación fallida, `500` error.
- **Nota:** este es el único endpoint de escritura del proyecto con validación completa; el resto (dificultad, levels, scores viejo, pistas, powerups) no valida nada más allá de tipos implícitos de Postgres.

---

## `pistas.routes.js` — montado en `/pistas` ⚪ (fuera del API Contract actual)

Archivo: `backend/src/routes/pistas.routes.js`
Queries usadas: `pistas.queries.js`

El propio `API_CONTRACT.md` no menciona pistas. Existe y funciona, pero es
funcionalidad "de más" para el alcance actual — el equipo tiene que decidir
si se queda para la entrega o se corta.

### `GET /`
- **Objetivo:** todas las pistas, o filtradas por nivel.
- **Función invocada:** `pistas.getPistasByLevel(nivel)` si viene `?nivel=`, si no `pistas.getAllPistas()`.
- **Respuesta:** `200` → array de pistas, `500` error.

### `GET /level/:level_id`
- **Objetivo:** mismo filtro que arriba pero como ruta dedicada (`GET /pistas?nivel=` y esta ruta hacen exactamente lo mismo — endpoint duplicado).
- **Función invocada:** `pistas.getPistasByLevel(level_id)`

### `GET /:id`
- **Objetivo:** una pista puntual. `200`/`404`/`500`.

### `POST /`, `PUT /:id`, `DELETE /:id`
- CRUD estándar sin validaciones, análogo a dificultad/levels. `level_id` no se valida contra la tabla `levels` antes de insertar (un id inexistente cae como `500` por FK constraint).

---

## `powerups.routes.js` — montado en `/powerups` ⚪ (fuera del API Contract actual)

Archivo: `backend/src/routes/powerups.routes.js`
Queries usadas: `powerups.queries.js`

Mismo caso que pistas: no está en el contrato, existe como catálogo
independiente (no referencia niveles ni scores). CRUD estándar:

- `GET /` → todos los powerups. `200`/`500`.
- `GET /:id` → uno puntual. `200`/`404`/`500`.
- `POST /` → crea `{ nombre, descripcion, tipo, valor }`. `201`/`500`.
- `PUT /:id` → actualiza. `200`/`404`/`500`.
- `DELETE /:id` → borra. `204`/`404`/`500`.
- Sin validaciones propias en ningún caso.

---

## `index.js` — router raíz, montado en `/api` desde `src/index.js`

Archivo: `backend/src/routes/index.js`

No define endpoints propios, solo monta cada sub-router en su prefijo:

| Prefijo | Archivo | Estado |
|---|---|---|
| `/dificultad` | `dificultad.routes.js` | 🟡 alias |
| `/dificultades` | `dificultad.routes.js` | 🟢 canónico |
| `/levels` | `levels.routes.js` | 🟡 alias |
| `/niveles` | `levels.routes.js` | 🟢 canónico |
| `/scores` | `scores.routes.js` | 🟡 alias |
| `/puntajes` | `puntajes.routes.js` | 🟢 canónico |
| `/pistas` | `pistas.routes.js` | ⚪ fuera de contrato |
| `/powerups` | `powerups.routes.js` | ⚪ fuera de contrato |

Nota: `/dificultad` y `/dificultades` son **el mismo router montado dos
veces** (igual con `/levels`/`/niveles`) — no hay dos archivos, es el mismo
código respondiendo en dos rutas distintas.

---

## Resumen de hallazgos (para priorizar el refactor)

1. **Validación desigual:** solo `puntajes.routes.js` valida en serio. `scores.routes.js` (mismo recurso, tabla `scores`) no valida nada — si el frontend llegara a usar el alias viejo por error, se cuelan datos corruptos.
2. **Manejo de errores repetido:** el bloque `try { ... } catch (err) { res.status(500).json({ error: err.message }) }` está copiado en las ~30 rutas. Exponer `err.message` crudo también puede filtrar detalles internos de Postgres al cliente.
3. **Endpoint duplicado dentro del mismo archivo:** `GET /pistas?nivel=` y `GET /pistas/level/:level_id` hacen exactamente lo mismo.
4. **FKs sin validar antes del INSERT:** `dificultad_id` en levels/pistas y `level_id` en scores/pistas no se chequean contra su tabla padre antes de insertar — dependen de que Postgres tire el error de constraint, que después se devuelve como `500` en vez de `400`.
5. **Orden de rutas correcto pero fragil:** `scores.routes.js` pone `/ranking/global` y `/level/:level_id/top` antes de `/:id` a propósito (para que Express no confunda el literal con un id) — cualquier ruta nueva con path literal tiene que respetar ese mismo orden.