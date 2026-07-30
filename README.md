# Cube of Stars

Trabajo Práctico Final. Introducción al Desarrollo de Software.

Cube of Stars es un juego de puzzle por casillas: el jugador se mueve por
un tablero en grilla tratando de llegar a la meta en la menor cantidad de
movimientos y tiempo posible, esquivando o usando a su favor mecánicas
como lava, pinchos, láseres, puertas con botón/placa/llave, un puente que
colapsa, y pickups que dan modo fantasma (atravesar una pared),
invulnerabilidad o fuerza (romper cajas). Hay niveles organizados por
dificultad (**Normal** y **Difícil**), música y efectos de sonido propios
de cada acción, un glosario de mecánicas ("Cómo jugar > Mecánicas") y
consejos progresivos por nivel (botón "💡 Consejos" dentro de la partida)
armados con datos reales del backend, y una tabla de puntajes por nivel y
dificultad donde se guarda el resultado de cada partida. Ver
[Qué falta / estado real](#qué-falta--estado-real) para el detalle de lo
pendiente.

## Integrantes del grupo

- Dante Luca Ortega
- Tomas Valentin Muruchi
- German Barrionuevo
- Esteban (completar apellido)

## Tecnologías

- **Frontend:** React 18 + Vite + React Router + Axios (CSR, pide datos al backend). Three.js solo para los fondos animados.
- **Backend:** Node.js + Express, API REST.
- **Base de datos:** PostgreSQL 16.
- **Infraestructura:** Docker Compose levanta los tres servicios juntos.

## Arquitectura: qué hace cada parte

Tres piezas independientes. Cada una tiene su propio README con el detalle
completo:

- **[`frontend/`](./frontend/README.md)** Toda la interfaz y la lógica del
  juego (motor de movimiento, mecánicas, animaciones, música y efectos de
  sonido). Es una SPA que no delega la lógica de una partida en curso al
  backend: solo pide el mapa de un nivel al entrar y manda el resultado al
  terminar. El motor (`juego/Juego/motorJuego.js`) es una función pura sin
  dependencias de React ni del navegador, separada a propósito para facilitar
  razonamiento y tests.
- **[`backend/`](./backend/README.md)** API REST sin estado (sin sesiones ni
  login): expone niveles, dificultades, puntajes, consejos y el glosario de
  mecánicas (`obstaculos`) como CRUD sobre Postgres. No tiene lógica de juego;
  solo persiste y valida datos. El detalle de cada endpoint está en
  [`ENDPOINTS.MD`](./ENDPOINTS.MD).
- **[`db/`](./db/README.md)** Esquema en `init.sql`: 5 tablas, 36 niveles de
  ejemplo, glosario de 18 mecánicas y consejos precargados para los primeros
  6 niveles.

**Flujo de una partida:** el frontend pide `GET /api/niveles/:id` al entrar,
juega todo localmente en el navegador (el backend no recibe cada movimiento),
y al ganar envía `POST /api/puntajes` con el resultado.

## Cómo levantar el proyecto

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### Pasos con Docker (recomendado)

```bash
git clone https://github.com/<usuario>/TP-Final-Introducci-n-desarrollo-software.git
cd TP-Final-Introducci-n-desarrollo-software
docker compose up --build
```

Esto levanta tres servicios:

| Servicio | URL / puerto | Qué hace |
|---|---|---|
| `db` | `localhost:5433` | Postgres con `db/init.sql` la primera vez que se crea el volumen |
| `backend` | `http://localhost:3000` | API REST |
| `frontend` | `http://localhost:5173` | App React |

Abrí `http://localhost:5173` en el navegador para jugar.

Para levantar un solo servicio:

```bash
docker compose up --build backend
docker compose up --build frontend
```

### Modo desarrollo (frontend y backend nativos)

Si preferís recarga en caliente en frontend/backend y solo la base en Docker:

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

### Recrear la base desde cero

Si cambiaste `init.sql` o tenés un volumen viejo (tablas `pistas`/`powerups`):

```bash
docker compose down -v
docker compose up --build
```

Ver [`db/README.md`](./db/README.md) para más detalle.

## Estructura del repositorio

```
.
├── docker-compose.yml
├── ENDPOINTS.MD          # Referencia completa de la API REST
├── README.md             # Este archivo
├── backend/              # API REST (ver backend/README.md)
├── frontend/             # App React (ver frontend/README.md)
└── db/
    ├── init.sql          # Esquema + datos de ejemplo
    └── README.md
```

## Modelo de datos

Cinco entidades, cada una con al menos 5 campos propios y al menos una
relación por foreign key. Detalle de tablas, queries y validaciones en
[`backend/README.md`](./backend/README.md) y [`db/README.md`](./db/README.md).

| Entidad | Relación |
|---|---|
| `dificultad` (Normal / Difícil) | Referenciada por `levels` y `obstaculos` |
| `levels` (niveles del juego) | → `dificultad`; referenciada por `scores` y `consejos` |
| `scores` (puntajes, expuestos como `/api/puntajes`) | → `levels` |
| `consejos` (progresivos, por nivel) | → `levels` |
| `obstaculos` (glosario de mecánicas) | → `dificultad` (opcional) |

## Contenido cargado en la base

| Recurso | Cantidad | Notas |
|---|---|---|
| Niveles Normal | 20 | IDs 1 a 20 |
| Niveles Difícil | 15 | IDs 21 a 35 |
| Sala de Mecánicas | 1 | ID 36, cuarto de prueba con todas las mecánicas |
| Glosario `obstaculos` | 18 filas | Una por mecánica implementada |
| Consejos | Solo niveles 1 a 6 | 2 a 5 consejos progresivos por nivel; el resto sin consejos aún |

## Qué falta / estado real

Registro honesto para la defensa oral:

- **`obstaculos` conectado:** reemplazó a `powerups` (nunca usada). El modal
  "Cómo jugar > Mecánicas" pide `GET /api/obstaculos`. `GET /api/dificultades`
  incluye `descripcion` para `SeleccionModo.jsx`.
- **`consejos` conectado:** reemplazó a `pistas`. El botón "💡 Consejos" pide
  todos los del nivel y los revela de a uno en el cliente. Los pickups del
  juego (fantasma, invulnerabilidad, fuerza) siguen en el `layout` de cada
  nivel, no en esta tabla.
- **Consejos incompletos:** solo hay consejos precargados para niveles 1 a 6.
  Faltan cargar consejos para los niveles 7 a 36.
- **Alias `/api/scores` eliminado** del backend. `puntajeServicio.js` aún
  exporta funciones muertas que apuntan ahí (no las usa ninguna pantalla).
- **Pantallas de administración:** el backend expone CRUD completo para las 5
  entidades; el frontend solo hace GET (y POST de puntajes). Falta UI admin.
- **Sin tests** en frontend ni backend. `motorJuego.js` es el candidato más
  barato por ser función pura.
- **Música sin asignar:** 2 pistas en `frontend/src/assets/Audios/Musicas/`
  (ver `SacadoDe.txt`) todavía sin pantalla asociada.
- **Teletransportadores sueltos:** en 10 niveles difíciles el valor 7 aparece
  una sola vez (sin par). No rompe el juego, pero el portal no hace nada.

## Uso de Inteligencia Artificial

Durante el desarrollo se usó asistencia de IA (Cursor / Claude) en:

- Diseño y revisión del esquema de base de datos (`db/init.sql`) y de las
  relaciones entre tablas.
- Conexión backend ↔ Postgres (pool, queries parametrizadas, healthcheck en
  Docker Compose).
- Integración frontend ↔ backend (servicios Axios, shape de respuestas).
- Documentación técnica (`README.md`, `ENDPOINTS.MD`, comentarios en código).
- Debugging de mecánicas del motor de juego y de la migración
  `pistas` → `consejos`, `powerups` → `obstaculos`.

Todo el código fue revisado, probado y comprendido por el equipo. Cada
integrante puede explicar las partes en las que participó y el funcionamiento
general del sistema.

## Capturas de pantalla

Las capturas deben agregarse en una carpeta `docs/screenshots/` y referenciarse
así. Mientras tanto, descripción de cada pantalla:

**Menú principal** (`/`)
Pantalla inicial con logo, botones para jugar, ver puntajes, "Cómo jugar" y
"Configuración". Fondo animado con shader de nieve (Three.js). Música de menú
en loop.

**Selección de modo** (`/seleccion-modo`)
Dos tarjetas (Normal y Difícil) con nombre y descripción traídos de
`GET /api/dificultades`. Botón de volver al menú.

**Selección de nivel** (`/seleccion-nivel/:modoId`)
Grilla de botones con los niveles de la dificultad elegida
(`GET /api/niveles?dificultad=`). Cada botón lleva a `/juego/:levelId`.

**Partida en curso** (`/juego/:levelId`)
Tablero CSS Grid con el personaje, HUD (movimientos, tiempo, muertes, llaves),
botón "💡 Consejos" y controles WASD reasignables. Al completar el nivel,
pantalla de victoria con guardado de puntaje (`POST /api/puntajes`).

**Tabla de puntajes** (`/puntajes`)
Filtros por dificultad y nivel. Lista ordenada por movimientos y tiempo
(`GET /api/puntajes?nivel=&dificultad=`).

**Ejemplo de cómo agregar capturas reales:**

```markdown
![Menú principal](./docs/screenshots/menu.png)
![Selección de modo](./docs/screenshots/seleccion-modo.png)
![Selección de nivel](./docs/screenshots/seleccion-nivel.png)
![Partida en curso](./docs/screenshots/partida.png)
![Tabla de puntajes](./docs/screenshots/puntajes.png)
```
