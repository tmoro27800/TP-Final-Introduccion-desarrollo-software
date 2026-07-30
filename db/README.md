# Base de datos — Cube of Stars

Un solo archivo: **`init.sql`**. Postgres lo ejecuta automáticamente la
primera vez que se crea el volumen del contenedor `db` (montado en
`/docker-entrypoint-initdb.d/init.sql` vía `docker-compose.yml`).

Crea las 5 tablas del modelo de datos y carga datos de ejemplo:
dificultades, niveles, glosario de obstáculos y consejos. No hay migraciones
incrementales: si cambia el esquema, se edita `init.sql` y se recrea la base
(ver "Reiniciar la base desde cero").

## Tablas

| Tabla | Para qué | Relación |
|---|---|---|
| `dificultad` | Normal / Difícil: slug (`nombre`), texto visible (`nombre_visible`), orden, descripción, multiplicador de puntaje | Referenciada por `levels.dificultad_id` y `obstaculos.dificultad_id` |
| `levels` | Un nivel: nombre, orden dentro de su dificultad, `layout` (matriz JSONB de enteros) | → `dificultad`; referenciada por `scores` y `consejos` (`ON DELETE CASCADE`) |
| `scores` | Puntaje al terminar partida: jugador (texto libre), movimientos, tiempo en segundos | → `levels` |
| `consejos` | Tips progresivos por nivel (texto, orden, tipo, fecha de creación) | → `levels` (`NOT NULL`, `UNIQUE (level_id, orden)`) |
| `obstaculos` | Glosario de mecánicas (Piso, Pared, Lava, Láser, Puerta, etc.) | → `dificultad` (opcional; `NULL` = en todas) |

### Historial de cambios relevantes

- **`obstaculos`** reemplazó a `powerups` (catálogo nunca usado). Conectado al
  modal "Cómo jugar > Mecánicas" vía `GET /api/obstaculos`.
- **`consejos`** reemplazó a `pistas`: `level_id` pasó a `NOT NULL`, se agregó
  `UNIQUE (level_id, orden)` y `creado_en` reemplazó a `veces_usada`.

Los pickups que se usan *durante* una partida (fantasma, fuerza,
invulnerabilidad) siguen hardcodeados en el `layout` de cada nivel.
`obstaculos` es solo el texto informativo del glosario.

## Datos de ejemplo cargados

| Recurso | Cantidad | Detalle |
|---|---|---|
| Dificultades | 2 | `normal`, `dificil` |
| Niveles Normal | 20 | IDs 1 a 20 (`dificultad_id = 1`) |
| Niveles Difícil | 15 | IDs 21 a 35 (`dificultad_id = 2`) |
| Sala de Mecánicas | 1 | ID 36, cuarto de prueba con todas las mecánicas |
| Glosario `obstaculos` | 18 filas | Una por mecánica implementada |
| Consejos | 6 niveles | Solo niveles 1 a 6, entre 2 y 5 consejos progresivos cada uno |

Los 35 niveles de diseño fueron remapeados desde una convención externa
(valores 8=lava y 9=vacío del archivo original → 13=LAVA y 15=VACIO en este
proyecto, ver `frontend/src/juego/Juego/tiposCelda.js`). Se corrigieron
niveles sin meta (Nivel 4 y Nivel 30). Queda pendiente avisar al diseñador:
en 10 niveles difíciles el teletransportador (7) aparece sin par.

## El campo `layout`

Matriz (array de arrays) de enteros, un valor por celda del mapa.
El significado de cada número es convención compartida con el frontend.
Lista completa y actualizada:

[`frontend/src/juego/Juego/tiposCelda.js`](../frontend/src/juego/Juego/tiposCelda.js)

El comentario al inicio de `init.sql` solo menciona los 4 valores del
prototipo original (`0` piso, `1` pared, `2` jugador, `3` meta). Desde
entonces se agregaron ~15 mecánicas más.

## Cómo se conecta

**Con Docker Compose** (`docker compose up -d db` desde la raíz):

- Postgres expuesto en puerto **`5433`** del host (`"5433:5432"` en
  `docker-compose.yml`), para no chocar con Postgres nativo en `5432`.
- El backend usa `DB_HOST=db` y puerto `5432` dentro de la red Docker.

**Credenciales por defecto** (coinciden con `backend/.env.example`):

| Campo | Valor |
|---|---|
| Usuario | `postgres` |
| Contraseña | `postgres` |
| Base | `puzzle_game` |

## Reiniciar la base desde cero

Útil si cambiaste `init.sql` o la base quedó inconsistente.
**Borra todos los datos** (puntajes cargados, etc.):

```bash
docker compose down -v
docker compose up -d db
```

## Ver los datos a mano

Con Docker levantado:

```bash
docker compose exec db psql -U postgres -d puzzle_game
```

Consultas útiles:

```sql
\dt
SELECT id, name, dificultad_id FROM levels ORDER BY id;
SELECT COUNT(*) FROM levels WHERE dificultad_id = 1;
SELECT COUNT(*) FROM levels WHERE dificultad_id = 2;
SELECT * FROM scores ORDER BY completed_at DESC LIMIT 10;
SELECT level_id, COUNT(*) FROM consejos GROUP BY level_id ORDER BY level_id;
```
