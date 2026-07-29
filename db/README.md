# Base de datos — Cube of Stars

Un solo archivo: **`init.sql`**. Postgres lo corre automáticamente la
primera vez que se crea el volumen del contenedor `db` (ver
`docker-compose.yml`: se monta como
`/docker-entrypoint-initdb.d/init.sql`) — crea las 5 tablas del modelo de
datos y carga datos de ejemplo (dificultades, niveles y el glosario de
obstáculos). No hay un sistema de migraciones incrementales: si cambia el
esquema, se edita directamente `init.sql` y se recrea la base (ver
"Reiniciar la base desde cero" más abajo).

## Tablas

| Tabla | Para qué | Relación |
|---|---|---|
| `dificultad` | Normal / Difícil — slug (`nombre`), texto a mostrar (`nombre_visible`), orden, descripción y un multiplicador de puntaje (pensado para un futuro ranking global ponderado) | referenciada por `levels.dificultad_id` y `obstaculos.dificultad_id` |
| `levels` | Un nivel del juego: nombre, orden dentro de su dificultad, y `layout` (el mapa, como matriz JSONB de enteros) | → `dificultad`; referenciada por `scores.level_id` (`ON DELETE CASCADE`) y `consejos.level_id` (`ON DELETE CASCADE`) |
| `scores` | Un puntaje guardado al terminar una partida: nivel, nombre de jugador (texto libre, no hay login), movimientos, tiempo en segundos | → `levels` |
| `consejos` | Consejos progresivos para destrabarse en un nivel (texto, orden de revelado, tipo, fecha de creación) | → `levels` (`NOT NULL`) |
| `obstaculos` | Glosario de las mecánicas del tablero (Piso, Pared, Lava, Pinchos, Láser, Puerta, etc. — una fila por cada una): slug interno, nombre visible, descripción, tipo, orden de lectura | → `dificultad` (opcional, `NULL` = aparece en todas) |

`obstaculos` reemplaza a lo que antes era `powerups` (una tabla de
catálogo que nunca se llegó a usar desde el frontend) — hoy **sí está
conectada**: el modal "Cómo jugar > Mecánicas" del frontend arma su lista
pidiendo `GET /api/obstaculos` en vez de tener el glosario hardcodeado
(ver `frontend/src/juego/Menu/mecanicasInfo.js`). Los pickups que se usan
*durante* una partida (fantasma/fuerza/invulnerabilidad) siguen
hardcodeados en `layout`, no salen de esta tabla — `obstaculos` es solo
el texto informativo del glosario, no cambia cómo funciona el motor.

`consejos` se llamaba `pistas` — se renombró y se le hicieron tres ajustes:
`level_id` pasó a ser `NOT NULL` (un consejo sin nivel no tenía sentido),
se agregó `UNIQUE (level_id, orden)`, y se sacó el contador `veces_usada`
(reemplazado por `creado_en`, un timestamp que se llena solo) porque el
frontend pide todos los consejos de un nivel juntos y los revela de a uno
**en el cliente** (ver `frontend/src/juego/Consejos/useConsejos.js`), así
que un contador de "pedido individual" del lado del servidor no tenía
forma de llenarse de verdad.

`init.sql` trae 6 niveles de ejemplo (2 `normal`, 4 `dificil`, con un
comentario arriba de cada `INSERT` describiendo su recorrido), las 18
filas de `obstaculos` (una por cada mecánica implementada) y 2-5 consejos
progresivos por cada uno de esos 6 niveles.

## El campo `layout`

Es una matriz (array de arrays) de enteros, un valor por celda del mapa.
El significado de cada número es una convención compartida con el
frontend — la lista completa y actualizada vive en
[`frontend/src/juego/Juego/tiposCelda.js`](../frontend/src/juego/Juego/tiposCelda.js)
(el comentario en `init.sql` solo menciona los primeros 4 valores del
prototipo original: `0` piso, `1` pared, `2` jugador, `3` meta — desde
entonces se sumaron ~15 mecánicas más, ver ese archivo para la lista real).

## Cómo se conecta

- **Con Docker Compose** (`docker compose up -d db` desde la raíz): el
  contenedor expone Postgres en el puerto **`5433`** del host (mapeo
  `"5433:5432"` en `docker-compose.yml`), para no chocar con una
  instalación de Postgres nativa que ya tengas escuchando en el `5432` de
  siempre. Si te conectás con un cliente SQL (DBeaver, `psql`) desde tu
  máquina, usá `5433`. El backend, en cambio, sigue usando `5432` porque
  habla con el contenedor desde *dentro* de la red de Docker (`DB_HOST=db`
  en el `environment` del servicio `backend`), donde ese mapeo de puertos
  no aplica.
- Credenciales por defecto (coinciden con `backend/.env.example`): user
  `postgres`, password `postgres`, base `puzzle_game`.

## Reiniciar la base desde cero

Útil si cambiaste `init.sql` o si la base quedó en un estado raro durante
desarrollo. **Borra todos los datos** (niveles/puntajes/consejos/obstáculos
que hayas cargado a mano) — no usar sobre una base con datos que te
importe conservar:

```bash
docker compose down -v   # baja los contenedores y borra el volumen de Postgres
docker compose up -d db  # crea el volumen de nuevo y corre init.sql desde cero
```

## Ver los datos a mano

Con Docker ya levantado:

```bash
docker compose exec db psql -U postgres -d puzzle_game
```

Adentro, algunos ejemplos:

```sql
\dt                                   -- listar tablas
SELECT id, name, dificultad_id FROM levels ORDER BY id;
SELECT * FROM scores ORDER BY completed_at DESC LIMIT 10;
```
