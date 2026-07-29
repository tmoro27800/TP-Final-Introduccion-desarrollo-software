# Documentación de endpoints — `backend/src/routes/`

Este documento detalla, archivo por archivo, cada endpoint expuesto por el
backend: método HTTP, ruta, objetivo, función de `db/queries/` que invoca,
parámetros, validaciones y respuestas posibles. Es el detalle "función por
función" que complementa a `backend/README.md` (que da la vista rápida en
tabla) y a `API_CONTRACT.md` (que es el contrato original acordado con el
frontend, hoy ya superado por lo que hay implementado — ver la nota al
principio de ese archivo).

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

## `puntajes.routes.js` — montado en `/puntajes` 🟢 (canónico, API Contract)

Archivo: `backend/src/routes/puntajes.routes.js`
Queries usadas: `puntajes.queries.js` + `dificultad.queries.js` + `levels.queries.js` (para las validaciones cruzadas)

Trabaja sobre la misma tabla `scores`, pero con los nombres de campo del
contrato y validación completa (el alias viejo en inglés que existía sobre
esta misma tabla, sin validar nada, ya se borró — ver el hallazgo #5 más
abajo). Define `JUGADOR_MAX_LEN = 50` (igual al `VARCHAR(50)` de
`player_name` en la DB).

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
- **Nota:** este es el único endpoint de escritura del proyecto con validación completa de negocio; `obstaculos` y `consejos` validan campos obligatorios y sus FKs (`dificultad_id`/`level_id`), pero dificultad/levels no validan nada más allá de tipos implícitos de Postgres.

---

## `consejos.routes.js` — montado en `/consejos` ⚪ (fuera del API Contract original — pero, a diferencia de la vieja "pistas", sí está en uso real)

Archivo: `backend/src/routes/consejos.routes.js`
Queries usadas: `consejos.queries.js` + `levels.queries.js` (para validar `level_id`)

Antes se llamaba `pistas.routes.js`. `consejos` son tips progresivos por
nivel — el frontend pide `GET /?nivel=<id>` (todos los del nivel, ya
ordenados por `orden`) y los va revelando de a uno **del lado del
cliente** (ver `frontend/src/juego/Consejos/useConsejos.js`), así que no
hace falta un endpoint de "marcar como visto" — de paso se eliminó el
endpoint duplicado que tenía `pistas.routes.js` (`GET /level/:level_id`
hacía exactamente lo mismo que `GET /?nivel=`).

### `GET /`
- **Objetivo:** consejos de un nivel (`?nivel=<id>`), o todos si no se pasa el query param.
- **Función invocada:** `consejos.getConsejosByLevel(nivel)` si viene `?nivel=`, si no `consejos.getAllConsejos()`.
- **Respuesta:** `200` → array de consejos, `500` error.

### `GET /:id`
- **Objetivo:** un consejo puntual. `200`/`404`/`500`. A diferencia de la vieja `pistas.routes.js`, esta ruta ya no incrementa ningún contador (no existe `veces_usada`/`veces_visto` — ver la nota de `creado_en` en `backend/README.md`).

### `POST /`, `PUT /:id`, `DELETE /:id`
- **Validaciones:** `level_id`/`texto`/`orden` obligatorios en `POST` (`texto`/`orden` en `PUT`); `level_id` se valida contra la tabla `levels` (`400` si no existe) — mismo criterio que ya tenía `pistas.routes.js`. `UNIQUE (level_id, orden)` en la base evita cargar dos consejos del mismo nivel con el mismo orden (un choque de unicidad cae como `500` genérico, no `400` — no se valida explícito antes del INSERT).
- **Respuesta:** `201`/`200` con el registro, `400` en validación, `404` (PUT/DELETE) si no existe, `500` error.

---

## `obstaculos.routes.js` — montado en `/obstaculos` ⚪ (fuera del API Contract original — pero, a diferencia de la vieja "pistas", sí está en uso real)

Archivo: `backend/src/routes/obstaculos.routes.js`
Queries usadas: `obstaculos.queries.js` + `dificultad.queries.js` (para validar `dificultad_id`)

Reemplaza a la vieja tabla/ruta `powerups` (nunca se llegó a usar desde el
frontend). `obstaculos` es el glosario de mecánicas del tablero — una fila
por cada una (Lava, Pinchos, Láser, Puerta, etc., ver `db/init.sql`) — y
**sí está conectado**: `Menu.jsx` pide `GET /` para armar el modal "Cómo
jugar > Mecánicas" en vez de tener esa lista hardcodeada en el frontend.

### `GET /`
- **Objetivo:** el glosario completo, ordenado por `orden` — el orden de lectura pensado para el modal.
- **Función invocada:** `obstaculos.getAllObstaculos()`
- **Respuesta:** `200` → array de obstáculos, `500` error.

### `GET /:id`
- **Objetivo:** un obstáculo puntual. `200`/`404`/`500`.

### `POST /` / `PUT /:id`
- **Objetivo:** crear/editar un obstáculo (uso administrativo, no lo llama el jugador).
- **Body:** `nombre`, `nombre_visible`, `descripcion`, `tipo`, `orden`, `dificultad_id` (opcional).
- **Validaciones:** `nombre`/`nombre_visible`/`descripcion`/`tipo`/`orden` obligatorios (`400` si falta alguno); si viene `dificultad_id`, se valida que exista de verdad contra la tabla `dificultad` (`400` si no) — mismo criterio que tenía `powerups.routes.js` antes de la migración.
- **Respuesta:** `201`/`200` con el registro, `400` en validación, `404` (solo PUT) si no existe, `500` error.

### `DELETE /:id`
- Borra un obstáculo. `204`/`404`/`500`.

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
| `/puntajes` | `puntajes.routes.js` | 🟢 canónico |
| `/consejos` | `consejos.routes.js` | ⚪ fuera de contrato, pero en uso real (`Nivel.jsx`) |
| `/obstaculos` | `obstaculos.routes.js` | ⚪ fuera de contrato, pero en uso real (`Menu.jsx`) |

Nota: `/dificultad` y `/dificultades` son **el mismo router montado dos
veces** (igual con `/levels`/`/niveles`) — no hay dos archivos, es el mismo
código respondiendo en dos rutas distintas.

---

## Resumen de hallazgos (para priorizar el refactor)

1. **Validación desigual:** `puntajes.routes.js`, `obstaculos.routes.js` y `consejos.routes.js` validan en serio (campos obligatorios + FKs). `dificultad`/`levels` no validan nada más allá de tipos implícitos de Postgres.
2. **Manejo de errores repetido:** el bloque `try { ... } catch (err) { res.status(500).json({ error: err.message }) }` está copiado en las ~20 rutas. Exponer `err.message` crudo también puede filtrar detalles internos de Postgres al cliente.
3. **FKs sí validadas donde importa:** `levels` (`dificultad_id`), `obstaculos` (`dificultad_id`) y `consejos` (`level_id`) chequean la FK contra su tabla padre antes de insertar/actualizar, devolviendo `400` con un mensaje claro en vez de dejar que Postgres tire un error de constraint crudo como `500`.
4. **Ya no existe `/api/scores`:** el alias viejo (`scores.routes.js`/`scores.queries.js`) se borró del backend. `frontend/src/servicios/puntajeServicio.js` todavía exporta funciones que le apuntan (`getGlobalRanking`, `getScoresbyLevel`, etc.) — no las llama ninguna pantalla hoy, pero si se llegaran a usar, van a devolver 404. Ver la nota en `frontend/README.md`.
5. **`pistas` se renombró a `consejos`** (mismo criterio que `powerups` → `obstaculos`): `level_id` ahora es `NOT NULL`, se sacó `veces_usada` (reemplazado por `creado_en`), se agregó `UNIQUE (level_id, orden)`, y se eliminó el endpoint `GET /pistas/level/:level_id` que duplicaba a `GET /consejos?nivel=`.