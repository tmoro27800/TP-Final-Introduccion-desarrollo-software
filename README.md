# Cube of Stars

Trabajo Práctico Final — Introducción al Desarrollo de Software.

Cube of Stars es un juego de puzzle por casillas: el jugador se mueve por
un tablero en grilla (paredes, piso, meta) tratando de llegar al objetivo
en la menor cantidad de movimientos y tiempo posible. Hay niveles
organizados por dificultad (**Normal** y **Difícil**), pistas para
destrabarse si te quedás atascado, powerups que ayudan durante la partida,
y una tabla de puntajes por nivel + dificultad donde se guarda el resultado
de cada partida.

## Integrantes del grupo


- Dante Luca Ortega
- Tomas Valentin Muruchi
- German Barrionuevo
-Esteban (que complete con su apellido)

## Tecnologías

- **Frontend:** React + Vite + React Router + Axios (CSR — pide todo al backend).
- **Backend:** Node.js + Express, API REST.
- **Base de datos:** PostgreSQL 16.
- **Todo el sistema se levanta con Docker Compose.**

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
- **`db`** — Postgres en el puerto `5432`, con el esquema de `db/init.sql` cargado automáticamente la primera vez.
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
├── frontend/      # App en React
└── db/
    ├── init.sql   # esquema completo + datos de ejemplo
    └── agregar_campos_dificultad.sql   # migración para bases ya creadas
```

## Modelo de datos

5 entidades, cada una con al menos 5 campos propios y al menos una relación
por foreign key. Detalle completo (queries, endpoints, validaciones) en
[`backend/README.md`](./backend/README.md).

| Entidad | Relación |
|---|---|
| `dificultad` (Normal / Difícil) | referenciada por `levels` y `powerups` |
| `levels` (niveles del juego) | → `dificultad`; referenciada por `scores` y `pistas` |
| `scores` (puntajes) | → `levels` |
| `pistas` | → `levels` |
| `powerups` | → `dificultad` |

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

