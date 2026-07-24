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

Todos bajo el prefijo `/api` (por el `app.use('/api', ...)` de arriba):

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/dificultad` | Listar todas |
| GET | `/api/dificultad/:id` | Una por id |
| POST | `/api/dificultad` | Crear |
| PUT | `/api/dificultad/:id` | Editar |
| DELETE | `/api/dificultad/:id` | Borrar |
| GET | `/api/levels` | Listar todos |
| GET | `/api/levels/:id` | Uno por id |
| POST | `/api/levels` | Crear |
| PUT | `/api/levels/:id` | Editar |
| DELETE | `/api/levels/:id` | Borrar |
| GET | `/api/scores` | Listar todos |
| GET | `/api/scores/:id` | Uno por id |
| GET | `/api/scores/ranking/global` | Ranking global (regla de negocio) |
| GET | `/api/scores/level/:level_id/top` | Mejores puntajes de un nivel |
| POST | `/api/scores` | Crear (al completar un nivel) |
| PUT | `/api/scores/:id` | Editar |
| DELETE | `/api/scores/:id` | Borrar |
| GET | `/api/pistas/level/:level_id` | Pistas de un nivel |
| GET | `/api/pistas/:id` | Una por id |
| POST | `/api/pistas` | Crear |
| PUT | `/api/pistas/:id` | Editar |
| DELETE | `/api/pistas/:id` | Borrar |
| GET | `/api/powerups` | Listar todos |
| GET | `/api/powerups/:id` | Uno por id |
| POST | `/api/powerups` | Crear |
| PUT | `/api/powerups/:id` | Editar |
| DELETE | `/api/powerups/:id` | Borrar |
| GET | `/api/pistas-usadas/score/:score_id` | Pistas usadas en un puntaje |
| POST | `/api/pistas-usadas` | Registrar uso (body: `score_id`, `pista_id`) |
| PUT/DELETE | `/api/pistas-usadas/:id` | Editar / borrar |
| GET | `/api/powerups-usados/score/:score_id` | Power-ups usados en un puntaje |
| POST | `/api/powerups-usados` | Registrar uso (body: `score_id`, `powerup_id`) |
| PUT/DELETE | `/api/powerups-usados/:id` | Editar / borrar |

## Desde el frontend

Con el `api/client.js` que ya tiene el frontend, se usa así:

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

// Con el id del score recién creado, registrar que usó una pista
await api.post('/pistas-usadas', { score_id: score.id, pista_id: 7 })
```

Ojo: `VITE_API_URL` en el `.env` del frontend apunta a `http://localhost:3000`
(sin `/api`), así que el `path` que le pasás a `api.get`/`api.post` tiene que
incluir el prefijo, ej. `api.get('/api/scores/ranking/global')` — o si
prefieren, cambien `VITE_API_URL` a `http://localhost:3000/api` y así los
llamados del frontend quedan más cortos (`api.get('/scores/ranking/global')`).
Decidan una sola convención entre todo el grupo para no confundirse.
