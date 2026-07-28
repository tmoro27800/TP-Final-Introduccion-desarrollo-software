--1. dificultad
CREATE TABLE dificultad (
    id SERIAL PRIMARY KEY,
    -- "nombre" es el slug que viaja por toda la API como valor de "dificultad"
    -- (normal/dificil, siempre en minúsculas). "nombre_visible" es el texto
    -- para mostrar en pantalla ("Normal", "Dificil").
    nombre VARCHAR(30) NOT NULL UNIQUE,
    nombre_visible VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    multiplicador_puntaje NUMERIC(4,2) NOT NULL DEFAULT 1.0
);

-- Dos dificultades (modo libre se descartó).
INSERT INTO dificultad (nombre, nombre_visible, orden, descripcion, multiplicador_puntaje) VALUES
    ('normal', 'Normal', 1, 'Ritmo pausado, ideal para practicar', 1.0),
    ('dificil', 'Dificil', 2, 'Más obstáculos, menos margen de error', 1.5);

--2. niveles

CREATE TABLE levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL,
    dificultad_id INTEGER REFERENCES dificultad(id),
    -- layout: matriz (array de arrays) de enteros.
    -- 0 = piso, 1 = pared, 2 = posición inicial del jugador, 3 = meta.
    -- Formato acordado con el frontend (ver prepararNivel.js / useJuego.js).
    layout JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Niveles de ejemplo (mismo formato que Niveles.mock.json / NivelesDetalle.mock.json
-- del frontend) para poder probar la conexión de punta a punta. Se pueden borrar.
INSERT INTO levels (name, order_index, dificultad_id, layout) VALUES
    ('Nivel 1', 1, 1, '[[1,1,1,1,1,1,1],[1,2,0,0,0,0,1],[1,0,0,0,0,0,1],[1,0,0,0,0,0,1],[1,0,0,0,0,0,1],[1,0,0,0,1,3,1]]'),
    ('Nivel 2', 2, 1, '[[1,1,1,1,1,1,1,1],[1,2,0,0,0,0,0,1],[1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1],[1,1,3,1,0,0,0,1]]');

-- Nivel de prueba con las mecánicas nuevas (cajas, fantasma, teletransportador,
-- invulnerabilidad, lava, vacío, llaves, fuerza — ver
-- frontend/src/juego/Juego/motorJuego.js y tiposCelda.js). Mismo layout que
-- frontend/src/juego/Juego/nivelDePrueba.js (usado ahí para poder probar el
-- motor sin depender de esta base). Recorrido: llave -> empujar caja
-- (bordear por arriba) -> atravesar pared con fantasma -> cruzar lava con
-- invulnerabilidad -> destruir caja con fuerza -> teletransportador -> meta.
INSERT INTO levels (name, order_index, dificultad_id, layout) VALUES
    ('Nivel 3', 3, 2, '[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,0,0,0,0,1,1,1,1,13,1,1,1,1,1,1,1,1,1,1,1],[1,2,0,16,0,4,0,1,5,1,0,10,13,0,18,4,0,7,0,7,0,0,0,3,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,15,4,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,15,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]');

-- Nivel de prueba con las mecánicas más nuevas (pinchos, láser, botón,
-- puerta, placa de presión, puente temporal — ver motorJuego.js/tiposCelda.js).
-- Enemigos (8) quedó descartado a pedido explícito, no aparece acá.
-- Diseño tipo "galería": un corredor de una sola celda de ancho con una
-- estación por mecánica, en orden. Recorrido: agarrar invulnerabilidad ->
-- cruzar pinchos -> cronometrar el láser (cicla cada 3 movimientos) ->
-- desviarse al pozo (filas 2-4, columnas 11-12) para empujar la caja hacia
-- el norte sobre la placa de presión (abre la puerta de la columna 15) ->
-- tocar el botón (abre también la puerta de la columna 20, de forma
-- permanente) -> cruzar el puente antes de que colapsen sus 3 celdas -> meta.
INSERT INTO levels (name, order_index, dificultad_id, layout) VALUES
    ('Nivel 4', 4, 2, '[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,17,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,2,0,10,0,6,0,0,9,0,0,0,4,0,0,12,0,0,11,0,12,0,0,14,14,14,0,3,1],[1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]');

-- Nivel "real" no lineal, pensado para combinar mecánicas con decisiones
-- genuinas en vez de una galería lineal (ver Nivel 4). Fila 3 es el
-- corredor principal; filas 1-2 y 4 son desvíos/alcobas.
-- Recorrido: empujar la caja hacia la alcoba de arriba (columnas 2-3) para
-- liberar la llave 1 -> agarrar Fantasma y usarlo hacia ARRIBA (única
-- dirección que atraviesa la pared; a la derecha hay pared doble a
-- propósito, para que no se pueda saltear la bóveda) para entrar a la
-- bóveda con la llave 2, salir por la columna 9 -> pinchos SIN protección
-- todavía: cruzarlos de frente cuesta +3 movimientos, o desviarse gratis por
-- la fila 4 (columnas 10-12) -> agarrar Invulnerabilidad recién acá, para
-- usarla más adelante -> empujar la segunda caja hacia abajo sobre la placa
-- de presión (columnas 14-15) para abrir la puerta -> cronometrar el láser
-- -> lava: cruzarla con la invulnerabilidad guardada, o rodearla gratis con
-- el teletransportador de la fila 2 (columnas 18/20) -> agarrar Fuerza y
-- destruir la tercera caja, o empujarla al vacío de la fila 4 (columna 22)
-- -> cruzar el puente antes de que colapse -> meta.
INSERT INTO levels (name, order_index, dificultad_id, layout) VALUES
    ('Nivel 5', 5, 2, '[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,16,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,0,0,1,1,1,1,1,0,1,1,1,1,0,0,1,1,7,1,7,0,0,1,1,1,1,1],[1,2,0,4,16,0,5,1,1,0,0,6,0,10,0,4,12,9,0,13,0,18,4,14,14,14,3,1],[1,1,1,0,1,1,1,1,1,1,0,0,0,1,1,17,1,1,1,1,1,1,15,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]');

--3. puntuaciones

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    -- No hay modo libre, así que todo puntaje tiene un nivel.
    level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    player_name VARCHAR(50) NOT NULL,
    moves INTEGER,
    time_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

--4. pistas

CREATE TABLE pistas (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    texto VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL,
    -- tipo de pista: "texto" (solo el mensaje), "resaltado" (marca una celda
    -- del mapa), "camino" (sugiere el próximo paso). Regla de negocio para
    -- que Juego.jsx sepa cómo renderizar cada pista.
    tipo VARCHAR(30) NOT NULL DEFAULT 'texto',
    --contador de uso real: se incrementa cada vez que un jugador pide esta
    -- pista puntual (GET /api/pistas/:id). Sirve para ver qué pistas se usan
    -- más y, a futuro, detectar niveles mal balanceados (todos piden la misma).
    veces_usada INTEGER NOT NULL DEFAULT 0
);

--5. powerups

CREATE TABLE powerups (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    tipo VARCHAR(30) NOT NULL,
    valor JSONB,
    -- a qué dificultad pertenece este powerup (NULL = disponible en todas).
    -- Le da a "powerups" la relación por FK que le faltaba.
    dificultad_id INTEGER REFERENCES dificultad(id)

);

INSERT INTO powerups (nombre, tipo, valor, dificultad_id) VALUES
    ('Deshacer movimiento', 'deshacer', '{"cantidad": 1}', NULL),
    ('Tiempo extra', 'tiempo_extra', '{"segundos": 30}', NULL),
    ('Pista gratis', 'pista_gratis', '{"cantidad": 1}', (SELECT id FROM dificultad WHERE nombre = 'dificil'));
