--1. dificultad
--1. dificultad
CREATE TABLE dificultad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    orden INTEGER NOT NULL
);

-- Dos dificultades, con el mismo nombre que usa el frontend
-- (SelectionMode.jsx / Niveles.mock.json: "normal" y "dificil").
INSERT INTO dificultad (nombre, orden) VALUES
    ('normal', 1),
    ('dificil', 2);

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

--3. puntuaciones

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
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
    orden INTEGER NOT NULL
);

--5. powerups

CREATE TABLE powerups (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    tipo VARCHAR(30) NOT NULL,
    valor JSONB
);


INSERT INTO powerups (nombre, tipo, valor) VALUES
    ('Deshacer movimiento', 'deshacer', '{"cantidad": 1}'),
    ('Tiempo extra', 'tiempo_extra', '{"segundos": 30}'),
    ('Pista gratis', 'pista_gratis', '{"cantidad": 1}');



