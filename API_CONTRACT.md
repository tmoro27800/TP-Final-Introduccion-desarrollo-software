# API Contract — Cube of Stars

## Niveles
 
### `GET /api/niveles`

**Propósito**: listado de todos los niveles, para la pantalla de selección de nivel (mostrar nombre, dificultad, y si está disponible/bloqueado).

**Parámetros**: ninguno.

**Respuesta esperada**:
```json
[
  {
    "id": 1,
    "nombre": "Nivel 1",
    "dificultad": "normal"
  },
  {
    "id": 2,
    "nombre": "Nivel 2",
    "dificultad": "dificil"
  }
]
```

---

### `GET /api/niveles/:id`
 
**Propósito**: traer el mapa y los datos de un nivel puntual, para jugarlo
(`Game.jsx`).

**Parámetros**:
- `id` (path) — id del nivel.

**Respuesta esperada**:
```json
{
  "id": 1,
  "nombre": "Nivel 1",
  "dificultad": "facil",
  "mapa": [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ]
}
```
---
 
### `GET /api/niveles?dificultad={dificultadId}`
 
**Propósito**: niveles filtrados por dificultad, para la pantalla de
selección de nivel cuando el usuario elige una dificultad.
 
**Parámetros**:
- `dificultad` (query) — id o nombre de la dificultad. `[A DEFINIR — ver
  sección Dificultades abajo, tiene que usar el mismo valor]`
**Respuesta esperada**: mismo formato que `GET /api/niveles`, pero filtrado.
 
---

## Dificultades
 
### `GET /api/dificultades`
 
**Propósito**: poblar el selector/tabs de dificultad. Actualmente el
frontend tiene hardcodeados tres valores (`normal`, `dificil`) —
este endpoint permitiría manejarlos desde el backend en vez de hardcodeados.
 
**Parámetros**: ninguno.
 
**Respuesta esperada**:
```json
[
  { "id": "normal", "nombre": "Normal" },
  { "id": "dificil", "nombre": "Dificil" }
]
```
 
**Nota**: `id` acá tiene que ser el mismo valor que se usa como
`dificultad` en el resto de los endpoints (niveles y puntajes), para poder
filtrar cruzado sin transformar nada en el frontend.
 
---
 
## Puntajes
 
### `GET /api/puntajes?nivel={nivelId}&dificultad={dificultadId}`
 
**Propósito**: tabla de puntajes de un nivel + dificultad específicos
(`Score.jsx`).
 
**Parámetros**:
- `nivel` (query) — id del nivel. Se omite si `dificultad=libre` (no hay
  niveles en modo libre, es un ranking único).
- `dificultad` (query) — `facil` | `normal` | `libre`.
**Respuesta esperada**:
```json
[
  {
    "jugador": "Tomi",
    "movimientos": 12,
    "tiempo": 40
  },
  {
    "jugador": "Nacho",
    "movimientos": 12,
    "tiempo": 45
  }
]
```
 
**Importante**:
- `tiempo` en **segundos** (número entero), no formateado como texto. El
  frontend lo convierte a `mm:ss` para mostrarlo.
- No hace falta que el backend ordene el array — el frontend ordena por
  menor cantidad de movimientos y, ante empate, por menor tiempo. Pero si
  el backend ya lo devuelve ordenado, mejor (menos trabajo en el cliente
  con listas grandes).
- No hay sistema de usuarios/login — `jugador` es un nombre de texto libre
  que el usuario tipea al terminar la partida, no un id de cuenta.

---

### `POST /api/puntajes`
 
**Propósito**: guardar el resultado de una partida recién completada.
 
**Body enviado**:
```json
{
  "nivel": 1,
  "dificultad": "facil",
  "jugador": "Tomi",
  "movimientos": 12,
  "tiempo": 40
}
```
 
**Respuesta esperada**: `[A DEFINIR — probablemente 201 con el registro
creado, o simplemente 204 sin body]`
 
**Preguntas para el backend**:
- ¿Hay algún límite de longitud/validación para `jugador` (nombre libre)?
- ¿Qué pasa si se manda un `nivel`/`dificultad` que no existe? ¿400?
---

## Pendiente de definir en conjunto
 
- [ ] Formato de IDs (número vs string) en todos los endpoints.
- [ ] camelCase vs snake_case en los nombres de campos.
- [ ] Formato del body de error para respuestas 4xx/5xx.
- [ ] Estructura exacta de `POST /api/puntajes` (código de respuesta,
  body de vuelta).
- [ ] Si `GET /api/niveles` debe indicar si el nivel está bloqueado/
  disponible para el usuario (sin sistema de login, quizás no aplica).