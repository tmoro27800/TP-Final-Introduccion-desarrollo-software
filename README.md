# Cube of Stars

Trabajo Práctico Final — Introducción al Desarrollo de Software.

Cube of Stars es un juego de puzzle por casillas: el jugador se mueve por
un tablero en grilla tratando de llegar a la meta en la menor cantidad de
movimientos y tiempo posible, esquivando o usando a su favor mecánicas
como lava, pinchos, láseres, puertas con botón/placa/llave, un puente que
colapsa, y pickups que dan modo fantasma (atravesar una pared),
invulnerabilidad o fuerza (romper cajas). Hay niveles organizados por
dificultad (**Normal** y **Difícil**), música y efectos de sonido propios
de cada acción, un glosario de mecánicas ("Cómo jugar > Mecánicas") y
consejos progresivos por nivel (botón "💡 Consejos" dentro de la partida)
armados con datos reales del backend, y una tabla de puntajes por nivel +
dificultad donde se guarda el resultado de cada partida. Ver
["Qué falta / estado real"](#qué-falta--estado-real) más abajo para el
detalle de qué queda pendiente.

## Integrantes del grupo


- Dante Luca Ortega
- Tomas Valentin Muruchi
- German Barrionuevo
- Esteban (que complete con su apellido)

## Tecnologías

- **Frontend:** React 18 + Vite + React Router + Axios (CSR — pide todo al backend). Three.js solo para los fondos animados.
- **Backend:** Node.js + Express, API REST.
- **Base de datos:** PostgreSQL 16.
- **Todo el sistema se levanta con Docker Compose.**

## Arquitectura — qué hace cada parte

Tres piezas independientes, cada una con su propio README con el detalle
completo:

- **[`frontend/`](./frontend/README.md)** — toda la interfaz y la lógica
  del juego en sí (motor de movimiento, mecánicas, animaciones, música y
  efectos de sonido). Es una SPA que no confía en el backend para NADA de
  la lógica de una partida en curso — solo le pide el mapa de un nivel al
  entrar, y le manda el resultado al terminar. El "motor" del juego
  (`juego/Juego/motorJuego.js`) es una función pura sin dependencias de
  React ni del navegador, separada a propósito del resto para que sea
  fácil de razonar y de testear.
- **[`backend/`](./backend/README.md)** — API REST sin estado (sin
  sesiones/login): expone niveles, dificultades, puntajes, consejos y el
  glosario de mecánicas (`obstaculos`), todo como CRUD sobre Postgres. No
  tiene ninguna lógica de juego — solo persiste y valida datos. El detalle
  función por función de cada endpoint está en [`ENDPOINTS.MD`](./ENDPOINTS.MD).
- **[`db/`](./db/README.md)** — el esquema (`init.sql`): 5 tablas, niveles
  y glosario de mecánicas de ejemplo precargados.

Flujo típico de una partida: `frontend` pide `GET /api/niveles/:id` al
entrar a un nivel → juega todo localmente en el navegador (el `backend`
no se entera de cada movimiento, solo del resultado final) → al ganar,
`frontend` manda `POST /api/puntajes` con el resultado.

## Cómo levantar el proyecto

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

### Pasos

```bash
git clone <url-del-repo>
cd TP-Final-Introduccion-desarrollo-software
docker compose up --build
```

Esto levanta tres servicios:
- **`db`** — Postgres, con el esquema de `db/init.sql` cargado automáticamente la primera vez. Expuesto al host en el puerto `5433` (no `5432`, para no chocar con una instalación de Postgres nativa que ya tengas corriendo) — ver [`db/README.md`](./db/README.md) si querés conectarte con un cliente SQL desde tu máquina.
- **`backend`** — API REST en `http://localhost:3000`.
- **`frontend`** — la app en `http://localhost:5173`.

Abrí `http://localhost:5173` en el navegador para jugar.

Cada servicio también se puede levantar por separado:
```bash
docker compose up --build backend
docker compose up --build frontend
```

### Modo desarrollo (alternativa sin Docker para frontend/backend)

Si preferís correr frontend y backend nativos (con recarga en caliente) y
solo la base en Docker:

```bash
docker compose up -d db
```

Backend:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Estructura del repositorio

```
.
├── docker-compose.yml
├── backend/       # API REST — ver backend/README.md para el detalle completo
├── frontend/      # App en React — ver frontend/README.md para el detalle completo
└── db/
    ├── init.sql   # esquema completo (5 tablas) + niveles de ejemplo — ver db/README.md
    └── README.md
```

## Modelo de datos

5 entidades, cada una con al menos 5 campos propios y al menos una relación
por foreign key. Detalle completo (queries, endpoints, validaciones) en
[`backend/README.md`](./backend/README.md).

| Entidad | Relación |
|---|---|
| `dificultad` (Normal / Difícil) | referenciada por `levels` y `obstaculos` |
| `levels` (niveles del juego) | → `dificultad`; referenciada por `scores` y `consejos` |
| `scores` (puntajes) | → `levels` |
| `consejos` (progresivos, por nivel) | → `levels` |
| `obstaculos` (glosario de mecánicas) | → `dificultad` |

## Qué falta / estado real

Para que quede registrado y no haya sorpresas en la defensa oral:

- **`obstaculos` (glosario de mecánicas) ya está conectado**: reemplazó a
  la vieja tabla `powerups` (que nunca se había llegado a usar) y hoy el
  modal "Cómo jugar > Mecánicas" del frontend arma su lista pidiéndosela
  al backend en vez de tenerla hardcodeada. También se sumó `descripcion`
  a `GET /api/dificultades`, para que `SeleccionModo.jsx` no tenga esos
  textos escritos dos veces.
- **`consejos` (antes `pistas`) también está conectada**: cada nivel tiene
  2-5 consejos progresivos cargados (el primero vago, el último casi
  resuelve el paso) — un botón "💡 Consejos" en el HUD de la partida los
  pide todos juntos y los va revelando de a uno, en el cliente (ver
  `frontend/src/juego/Consejos/useConsejos.js`). Los pickups que sí existen
  *durante* el juego (fantasma, invulnerabilidad, fuerza) son otra cosa:
  están hardcodeados en el `layout` de cada nivel, no salen de esta tabla.
- **El alias `/api/scores` ya se borró del backend**, pero
  `frontend/src/servicios/puntajeServicio.js` todavía tiene funciones
  muertas que le apuntan (no las llama ninguna pantalla, así que no rompen
  nada hoy, pero devolverían 404 si se llegaran a usar).
- **Niveles:** hay 2 Normal y 4 Difícil — se puede sumar contenido,
  especialmente del lado Normal.
- **Sin tests** (ni frontend ni backend). `motorJuego.js` (el motor del
  juego) es una función pura sin dependencias, así que es el candidato más
  barato para empezar a cubrir.
- Quedan 2 pistas de música (`frontend/src/assets/Audios/Musicas/`, ver
  `SacadoDe.txt`) sin asignar a ninguna pantalla todavía.

## Uso de Inteligencia Artificial

ayuda con el diseño de las bases de datos, ayuda con las conexiones
de backend y frontend.
<!--
Completar según corresponda: qué partes se armaron con asistencia de IA
(ej. debugging de la conexión a Postgres, diseño del esquema de datos,
generación de la colección de Postman para testear la API) y confirmar
que el equipo entiende y puede explicar todo el código entregado.
-->

## Capturas de pantalla

<!-- Reemplazar cada línea por la imagen correspondiente, ej: ![Menú](./docs/screenshots/menu.png) -->

**Menú principal**


**Selección de modo (dificultad)**


**Selección de nivel**


**Partida en curso**


**Tabla de puntajes**

