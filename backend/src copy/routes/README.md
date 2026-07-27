# routes/ — endpoints REST

Cada archivo expone el CRUD de una tabla como rutas de Express, usando las
queries de `db/queries/`. `routes/index.js` las junta todas.

## Instalación

Si todavía no tenés Express y CORS instalados en `backend/`:
```bash
npm install express cors
```

## Cómo conectarlo a tu servidor

En tu archivo principal (`app.js`, `index.js` o `server.js`, el que ya tengas
armado en `backend/`), agregá esto:

```js
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())          // permite que el frontend (otro puerto) le pegue al backend
app.use(express.json())  // sin esto, req.body va a llegar undefined en los POST/PUT

app.use('/api', require('./routes'))

app.listen(3000, () => console.log('Backend escuchando en el puerto 3000'))
```

**Las dos líneas de `app.use` antes de las rutas son obligatorias:**
- `cors()` — sin esto, el navegador bloquea los pedidos del frontend (puerto 5173)
  hacia el backend (puerto 3000) por política de seguridad del navegador
  (mismo origen). Es un error clásico: "todo compila pero el fetch nunca llega".
- `express.json()` — sin esto, cuando el frontend mande un `POST` con body JSON,
  `req.body` va a ser `undefined` en tus rutas, aunque el body sí haya viajado.

## Endpoints disponibles

Todos bajo el prefijo `/api`. **Convención definitiva del equipo: todo en
español** (`/dificultades`, `/niveles`). `/dificultad` y `/levels` siguen
andando como alias en inglés por compatibilidad, pero están deprecados —
sáquenlos de `routes/index.js` cuando el frontend termine de migrar a los
nombres en español.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/dificultad` o `/api/dificultades` | Listar todas |
| GET | `/api/dificultad/:id` (o `/dificultades/:id`) | Una por id |
| POST | `/api/dificultad` (o `/dificultades`) | Crear |
| PUT | `/api/dificultad/:id` (o `/dificultades/:id`) | Editar |
| DELETE | `/api/dificultad/:id` (o `/dificultades/:id`) | Borrar |
| GET | `/api/levels` o `/api/niveles` | Listar todos |
| GET | `/api/levels?dificultad=normal\|dificil` (o `/niveles?dificultad=...`) | Filtrar por dificultad (nombre, no id) |
| GET | `/api/levels/:id` (o `/niveles/:id`) | Uno por id |
| POST | `/api/levels` (o `/niveles`) | Crear |
| PUT | `/api/levels/:id` (o `/niveles/:id`) | Editar |
| DELETE | `/api/levels/:id` (o `/niveles/:id`) | Borrar |
| GET | `/api/scores` | Listar todos |
| GET | `/api/scores?nivel=<level_id>&dificultad=normal\|dificil` | Filtrar (ambos params opcionales; dificultad es el nombre, no un id) |
| GET | `/api/scores/:id` | Uno por id |
| GET | `/api/scores/ranking/global` | Ranking global (regla de negocio) |
| GET | `/api/scores/level/:level_id/top` | Mejores puntajes de un nivel |
| POST | `/api/scores` | Crear (al completar un nivel) |
| PUT | `/api/scores/:id` | Editar |
| DELETE | `/api/scores/:id` | Borrar |
| GET | `/api/pistas` | Listar todas |
| GET | `/api/pistas?nivel=<level_id>` | Filtrar por nivel (query string) |
| GET | `/api/pistas/level/:level_id` | Filtrar por nivel (path param, alternativa) |
| GET | `/api/pistas/:id` | Una por id |
| POST | `/api/pistas` | Crear |
| PUT | `/api/pistas/:id` | Editar |
| DELETE | `/api/pistas/:id` | Borrar |
| GET | `/api/powerups` | Listar todos |
| GET | `/api/powerups/:id` | Uno por id |
| POST | `/api/powerups` | Crear |
| PUT | `/api/powerups/:id` | Editar |
| DELETE | `/api/powerups/:id` | Borrar |

`pistas_usadas` y `powerups_usados` se dieron de baja (tabla, queries y
rutas) — ya no forman parte del proyecto.

## Desde el frontend

```js
// Traer el ranking
const ranking = await api.get('/scores/ranking/global')

// Guardar un puntaje al completar un nivel
const score = await api.post('/scores', {
  level_id: 3,
  player_name: 'Juan',
  moves: 12,
  time_seconds: 45,
})
```

Ojo: `VITE_API_URL` en el `.env` del frontend apunta a `http://localhost:3000`
(sin `/api`), así que el `path` que le pasás a `api.get`/`api.post` tiene que
incluir el prefijo, ej. `api.get('/api/scores/ranking/global')` — o si
prefieren, cambien `VITE_API_URL` a `http://localhost:3000/api` y así los
llamados del frontend quedan más cortos (`api.get('/scores/ranking/global')`).
**Esto sigue sin resolverse entre las dos partes del proyecto** — hoy conviven
las dos convenciones en distintos archivos de `services/` del frontend.

## Resuelto

- **Formato de `layout`**: confirmado, es la misma matriz que ya usa
  `prepararNivel.js`/`useJuego.js` del frontend — array de arrays de enteros,
  0=piso, 1=pared, 2=jugador, 3=meta. Las rutas de `levels` ahora validan esto
  en `POST`/`PUT` (400 si no es una matriz de enteros), y `init.sql` trae dos
  niveles de ejemplo con ese formato para probar de punta a punta.
- **Dificultades**: el equipo decidió 2 dificultades, en español, con estos
  nombres exactos: `normal` y `dificil` (los mismos que ya usa
  `SelectionMode.jsx`/`Niveles.mock.json` del frontend). `init.sql` ya crea
  la tabla `dificultad` con esas dos filas. Si tenías una base con las 3
  dificultades viejas (`Facil`/`Media`/`Dificil`), corré
  `db/migrar_a_2_dificultades.sql` una vez para pasarla a las nuevas sin
  perder los niveles/puntajes ya cargados.
- **Filtro por dificultad, siempre por nombre**: `GET /levels` y
  `GET /scores` reciben `?dificultad=normal` o `?dificultad=dificil`
  (case-insensitive) — **no** un id numérico. Es así porque
  `SelectionMode.jsx` navega directo a `/seleccion-nivel/normal` o
  `/dificil`, y ese string es el que viaja tal cual hasta el backend sin
  pasar nunca por un id.
- **Convención de nombres**: en español, definitivo (ver tabla de arriba).

## Pendiente de acordar con el equipo

- Sacar los alias en inglés (`/dificultad`, `/levels`) de
  `routes/index.js` una vez que el frontend le pegue solo a
  `/dificultades` y `/niveles`.
- `VITE_API_URL` del `.env` del frontend: definir si incluye `/api` o no
  (ver nota arriba), para que todos los `services/*.js` usen el mismo
  criterio.
