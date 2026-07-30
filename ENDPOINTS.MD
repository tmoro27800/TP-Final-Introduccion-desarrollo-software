# Documentación de la API REST — Cube of Stars

Referencia oficial de todos los endpoints del backend. Complementa la vista
general de [`backend/README.md`](./backend/README.md) con el detalle archivo
por archivo: método HTTP, ruta, objetivo, query invocada, parámetros,
validaciones y respuestas posibles.

**Base URL:** `http://localhost:3000/api` (Docker Compose o `npm run dev` en
`backend/`).

**Formato de error:** siempre `{ "error": "mensaje" }`.

**Convención de rutas:**

| Etiqueta | Significado |
|---|---|
| Canónico | Ruta en español que debe usar el frontend del juego |
| Alias | Mismo router montado dos veces con prefijo en inglés (`/dificultad`, `/levels`) |
| Admin | CRUD completo pensado para administración; el juego solo hace GET (y POST de puntajes) |

**Montaje** (`backend/src/routes/index.js`):

| Prefijo | Archivo | Etiqueta |
|---|---|---|
| `/dificultades` | `dificultad.routes.js` | Canónico |
| `/dificultad` | `dificultad.routes.js` | Alias |
| `/niveles` | `levels.routes.js` | Canónico |
| `/levels` | `levels.routes.js` | Alias |
| `/puntajes` | `puntajes.routes.js` | Canónico |
| `/consejos` | `consejos.routes.js` | Canónico (en uso) |
| `/obstaculos` | `obstaculos.routes.js` | Canónico (en uso) |

> `/dificultad` y `/dificultades` son el **mismo código** respondiendo en dos
> URLs. Igual con `/levels` y `/niveles`. El alias `/api/scores` **ya no
> existe** (se eliminó del backend).

---

## Resumen rápido (frontend del juego)

| Método | Ruta | Usado por |
|---|---|---|
| GET | `/api/dificultades` | `SeleccionModo.jsx` |
| GET | `/api/niveles?dificultad=` | `SeleccionNivel.jsx` |
| GET | `/api/niveles/:id` | `Juego.jsx` |
| GET | `/api/puntajes?nivel=&dificultad=` | `Puntaje.jsx` |
| POST | `/api/puntajes` | `Nivel.jsx` (al ganar) |
| GET | `/api/consejos?nivel=` | `useConsejos.js` |
| GET | `/api/obstaculos` | `Menu.jsx` (glosario de mecánicas) |

---

## `dificultad.routes.js`

Archivo: `backend/src/routes/dificultad.routes.js`  
Queries: `backend/src/db/queries/dificultad.queries.js`  
Montado en: `/api/dificultades` (canónico) y `/api/dificultad` (alias).

### `GET /`

- **Objetivo:** listar dificultades para la pantalla de selección de modo.
- **Función:** `dificultad.getAllDificultadesContrato()`
- **Parámetros:** ninguno.
- **Validaciones:** ninguna.
- **Respuesta:**
  - `200` → `[{ id, nombre, descripcion }]`
    - `id`: slug (`"normal"`, `"dificil"`), no el PK numérico de Postgres.
    - `nombre`: texto visible (`"Normal"`, `"Dificil"`).
    - `descripcion`: texto para la tarjeta de cada modo en el frontend.
  - `500` → `{ error: mensaje }`.

**Ejemplo:**

```json
[
  { "id": "normal", "nombre": "Normal", "descripcion": "Ritmo pausado, ideal para practicar" },
  { "id": "dificil", "nombre": "Dificil", "descripcion": "Más obstáculos, menos margen de error" }
]
```

### `GET /:id`

- **Objetivo:** consultar una dificultad por PK numérico interno.
- **Función:** `dificultad.getDificultadById(id)`
- **Parámetros:** `id` (path, entero).
- **Respuesta:**
  - `200` → `{ id, nombre, nombre_visible, orden, descripcion, multiplicador_puntaje }`
  - `404` → `{ error: "No encontrado" }`
  - `500` → `{ error: mensaje }`

### `POST /`

- **Objetivo:** crear una dificultad (administración / seed).
- **Función:** `dificultad.createDificultad({ nombre, nombre_visible, orden, descripcion, multiplicador_puntaje })`
- **Body:** `nombre`, `nombre_visible`, `orden`, `descripcion` (obligatorios); `multiplicador_puntaje` (opcional, default `1.0` en DB).
- **Validaciones:**
  - Faltan campos obligatorios → `400`.
  - `nombre` duplicado (UNIQUE en DB) → `500` con mensaje de Postgres.
- **Respuesta:** `201` con el registro creado, o `400`/`500`.

### `PUT /:id`

- **Objetivo:** editar una dificultad existente.
- **Función:** `dificultad.updateDificultad(id, { ... })`
- **Body:** mismos campos que POST (todos obligatorios en el body).
- **Validaciones:** igual que POST; si el `id` no existe → `404`.
- **Respuesta:** `200` actualizado, `400`, `404`, `500`.

### `DELETE /:id`

- **Objetivo:** borrar una dificultad.
- **Función:** `dificultad.deleteDificultad(id)`
- **Riesgo:** `levels.dificultad_id` referencia esta tabla sin `ON DELETE CASCADE`. Borrar una dificultad con niveles asociados puede fallar por FK → `500`.
- **Respuesta:** `204` sin body, `404`, `500`.

---

## `levels.routes.js`

Archivo: `backend/src/routes/levels.routes.js`  
Queries: `backend/src/db/queries/levels.queries.js` + `dificultad.queries.js`  
Montado en: `/api/niveles` (canónico) y `/api/levels` (alias).

**Helper local:** `esLayoutValido(layout)` valida que `layout` sea un array de
arrays de enteros (convención compartida con
`frontend/src/juego/Juego/tiposCelda.js`).

### `GET /`

- **Objetivo:** listado de niveles para selección (sin mapa completo).
- **Función:** `levels.getAllLevels(dificultad?)`
- **Query:** `dificultad` (opcional), slug case-insensitive (`normal` / `dificil`).
- **Validaciones:** si el slug no matchea, devuelve lista vacía (no es error).
- **Respuesta:** `200` → `[{ id, nombre, dificultad }]`, `500` en error.

### `GET /:id`

- **Objetivo:** traer mapa y datos de un nivel para jugarlo (`Juego.jsx` → `Nivel.jsx`).
- **Función:** `levels.getLevelById(id)`
- **Respuesta:**
  - `200` → `{ id, nombre, dificultad, mapa }` (`mapa` = matriz JSONB de enteros).
  - `404` → `{ error: "No encontrado" }`
  - `500` → `{ error: mensaje }`

### `POST /`

- **Objetivo:** crear un nivel (administración / carga de contenido).
- **Función:** `levels.createLevel({ name, order_index, dificultad_id, layout })`
- **Body:** `name`, `order_index`, `layout` (obligatorios); `dificultad_id` (opcional).
- **Validaciones:**
  - Faltan `name` u `order_index` → `400`.
  - `layout` inválido (no matriz de enteros) → `400`.
  - `dificultad_id` informado pero inexistente → `400`.
- **Respuesta:** `201` con el nivel creado (columnas crudas de Postgres), `400`, `500`.

### `PUT /:id`

- **Objetivo:** editar un nivel existente.
- **Función:** `levels.updateLevel(id, { ... })`
- **Validaciones:**
  - `name` y `order_index` obligatorios en body → `400` si faltan.
  - `layout` validado solo si viene en el body.
  - `dificultad_id` validado contra tabla `dificultad` si viene informado.
  - Registro inexistente → `404`.
- **Respuesta:** `200`, `400`, `404`, `500`.

### `DELETE /:id`

- **Objetivo:** borrar un nivel.
- **Función:** `levels.deleteLevel(id)`
- **Nota:** `scores.level_id` y `consejos.level_id` tienen `ON DELETE CASCADE` en
  `init.sql`. Borrar un nivel elimina también sus puntajes y consejos.
- **Respuesta:** `204`, `404`, `500`.

---

## `puntajes.routes.js`

Archivo: `backend/src/routes/puntajes.routes.js`  
Queries: `puntajes.queries.js` + `dificultad.queries.js` + `levels.queries.js`  
Montado en: `/api/puntajes` (canónico). Tabla Postgres: `scores`.

Constante: `JUGADOR_MAX_LEN = 50` (igual al `VARCHAR(50)` de `player_name`).

Los nombres de campo en request/response usan español del lado del cliente
(`jugador`, `movimientos`, `tiempo`, `nivel`) aunque las columnas en Postgres
estén en inglés.

### `GET /`

- **Objetivo:** tabla de puntajes de un nivel (y opcionalmente filtrar por dificultad). Usado por `Puntaje.jsx`.
- **Función:** `puntajes.getPuntajesFiltered({ level_id, dificultad_id })`
- **Query:** `nivel` (**obligatorio**), `dificultad` (opcional, slug).
- **Validaciones:**
  1. Falta `nivel` → `400`.
  2. `nivel` inexistente → `400`.
  3. Si viene `dificultad`, debe existir → `400` si no.
  4. Si `dificultad` no coincide con la del nivel → `400`.
- **Respuesta:**
  - `200` → `[{ id, jugador, movimientos, tiempo }]` ordenado por movimientos ASC, tiempo ASC.
  - `400` / `500`.

### `POST /`

- **Objetivo:** guardar el resultado de una partida completada (`Nivel.jsx`).
- **Función:** `puntajes.createPuntaje({ level_id, player_name, moves, time_seconds })`
- **Body:** `nivel`, `dificultad`, `jugador`, `movimientos`, `tiempo`.
- **Validaciones** (corta en la primera que falla):
  1. `nivel` obligatorio y existente.
  2. `dificultad` obligatoria, existente, y coherente con el nivel.
  3. `jugador`: trim, no vacío, máximo 50 caracteres.
  4. `movimientos`: entero `>= 0`.
  5. `tiempo`: entero `>= 0` (segundos).
- **Respuesta:**
  - `201` → `{ id, nivel, jugador, movimientos, tiempo, completed_at }`
  - `400` / `500`

### `GET /:id`

- **Objetivo:** consultar un puntaje puntual (administración / edición).
- **Función:** `puntajes.getPuntajeById(id)`
- **Respuesta:**
  - `200` → `{ id, nivel, jugador, movimientos, tiempo, completed_at }`
  - `404` → `{ error: "No encontrado" }`
  - `500` → `{ error: mensaje }`

### `PUT /:id`

- **Objetivo:** corregir un puntaje ya guardado. **No** permite cambiar nivel ni dificultad.
- **Función:** `puntajes.updatePuntaje(id, { player_name, moves, time_seconds })`
- **Body:** `jugador`, `movimientos`, `tiempo`.
- **Validaciones:** mismas reglas que POST para esos tres campos; registro inexistente → `404`.
- **Respuesta:** `200` con registro actualizado, `400`, `404`, `500`.

### `DELETE /:id`

- **Objetivo:** borrar un puntaje.
- **Función:** `puntajes.deletePuntaje(id)`
- **Respuesta:** `204` sin body, `404`, `500`.

---

## `consejos.routes.js`

Archivo: `backend/src/routes/consejos.routes.js`  
Queries: `consejos.queries.js` + `levels.queries.js`  
Montado en: `/api/consejos`.

Reemplaza a la vieja tabla/ruta `pistas`. El frontend pide todos los consejos
de un nivel juntos (`GET /?nivel=`) y los revela de a uno en el cliente (ver
`frontend/src/juego/Consejos/useConsejos.js`).

### `GET /`

- **Objetivo:** consejos de un nivel, o todos si no hay filtro.
- **Función:** `consejos.getConsejosByLevel(nivel)` si viene `?nivel=`, si no `consejos.getAllConsejos()`.
- **Query:** `nivel` (opcional, id numérico del nivel).
- **Respuesta:** `200` → array de `{ id, level_id, texto, orden, tipo, creado_en }` ordenado por `orden`, `500` en error.

### `GET /:id`

- **Objetivo:** un consejo puntual.
- **Función:** `consejos.getConsejoById(id)`
- **Respuesta:** `200`, `404`, `500`.

### `POST /`

- **Objetivo:** crear un consejo (administración).
- **Función:** `consejos.createConsejo({ level_id, texto, orden, tipo })`
- **Body:** `level_id`, `texto`, `orden` (obligatorios); `tipo` (opcional, default `"texto"`).
- **Validaciones:**
  - Campos obligatorios faltantes → `400`.
  - `level_id` inexistente → `400`.
  - Duplicado `(level_id, orden)` (UNIQUE en DB) → `500`.
- **Respuesta:** `201`, `400`, `500`.

### `PUT /:id`

- **Objetivo:** editar un consejo.
- **Función:** `consejos.updateConsejo(id, { texto, orden, tipo })`
- **Body:** `texto`, `orden` obligatorios; `tipo` opcional.
- **Respuesta:** `200`, `400`, `404`, `500`.

### `DELETE /:id`

- **Objetivo:** borrar un consejo.
- **Función:** `consejos.deleteConsejo(id)`
- **Respuesta:** `204`, `404`, `500`.

---

## `obstaculos.routes.js`

Archivo: `backend/src/routes/obstaculos.routes.js`  
Queries: `obstaculos.queries.js` + `dificultad.queries.js`  
Montado en: `/api/obstaculos`.

Glosario de mecánicas del tablero (Piso, Pared, Lava, Láser, etc.). Conectado
al modal "Cómo jugar > Mecánicas" de `Menu.jsx` vía `obstaculoServicio.js`.

### `GET /`

- **Objetivo:** glosario completo ordenado por `orden`.
- **Función:** `obstaculos.getAllObstaculos()`
- **Respuesta:** `200` → array de `{ id, nombre, nombre_visible, descripcion, tipo, orden, dificultad_id }`, `500`.

### `GET /:id`

- **Objetivo:** un obstáculo/mecánica puntual.
- **Función:** `obstaculos.getObstaculoById(id)`
- **Respuesta:** `200`, `404`, `500`.

### `POST /`

- **Objetivo:** crear una entrada del glosario (administración).
- **Función:** `obstaculos.createObstaculo({ ... })`
- **Body:** `nombre`, `nombre_visible`, `descripcion`, `tipo`, `orden` (obligatorios); `dificultad_id` (opcional, `NULL` = aparece en todas).
- **Validaciones:**
  - Campos obligatorios faltantes → `400`.
  - `dificultad_id` informado pero inexistente → `400`.
  - `nombre` duplicado (UNIQUE) → `500`.
- **Respuesta:** `201`, `400`, `500`.

### `PUT /:id`

- **Objetivo:** editar una entrada del glosario.
- **Función:** `obstaculos.updateObstaculo(id, { ... })`
- **Validaciones:** iguales que POST; registro inexistente → `404`.
- **Respuesta:** `200`, `400`, `404`, `500`.

### `DELETE /:id`

- **Objetivo:** borrar una entrada del glosario.
- **Función:** `obstaculos.deleteObstaculo(id)`
- **Respuesta:** `204`, `404`, `500`.

---

## Notas técnicas y pendientes

1. **Validación desigual:** `puntajes`, `obstaculos`, `consejos` y `levels`
   validan campos y FKs en serio. `dificultad` valida campos obligatorios en
   POST/PUT pero no previene choques de unicidad antes del INSERT.
2. **Manejo de errores:** el patrón `catch → res.status(500).json({ error: err.message })`
   se repite en todas las rutas. Puede filtrar detalles internos de Postgres al cliente.
3. **Alias en inglés:** `/api/dificultad` y `/api/levels` siguen montados por
   compatibilidad. El frontend del juego usa solo las rutas en español.
4. **`/api/scores` eliminado:** `frontend/src/servicios/puntajeServicio.js`
   todavía exporta funciones muertas que apuntan a ese prefijo. Ninguna pantalla
   las llama; devolverían 404 si se usaran. Ver [`frontend/README.md`](./frontend/README.md).
5. **Consejos en la base:** `init.sql` carga consejos solo para los niveles 1 a 6.
   El resto de los 36 niveles no tienen consejos precargados todavía.
