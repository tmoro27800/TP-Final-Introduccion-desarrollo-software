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

INSERT INTO powerups (nombre, tipo, valor) VALUES
    ('Deshacer movimiento', 'deshacer', '{"cantidad": 1}'),
    ('Tiempo extra', 'tiempo_extra', '{"segundos": 30}'),
    ('Pista gratis', 'pista_gratis', '{"cantidad": 1}' (SELECT id FROM dificultad WHERE nombre = 'dificil'));
 
