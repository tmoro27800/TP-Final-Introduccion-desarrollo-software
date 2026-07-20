--1. dificultad
CREATE TABLE dificultad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    orden INTEGER NOT NULL
);

INSERT INTO dificultad (nombre, orden) VALUES
    ('Facil', 1),
    ('Media', 2),
    ('Dificil', 3);

--2. niveles

CREATE TABLE levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL,
    dificultad_id INTEGER REFERENCES dificultad(id),
    layout JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

--3. sesiones de juego
CREATE TABLE play_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT true,
    muertes INTEGER DEFAULT 0
);

--4. puntuaciones

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    session_id UUID REFERENCES play_sessions(id),
    player_name VARCHAR(50) NOT NULL,
    moves INTEGER,
    time_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

--5. pistas

CREATE TABLE pistas (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    texto VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL
);

--6. powerups

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


-- 7. pistas_usadas
CREATE TABLE pistas_usadas (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES play_sessions(id) ON DELETE CASCADE,
    pista_id INTEGER REFERENCES pistas(id),
    used_at TIMESTAMP DEFAULT NOW()
);

-- 8. powerups_usados
CREATE TABLE powerups_usados (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES play_sessions(id) ON DELETE CASCADE,
    powerup_id INTEGER REFERENCES powerups(id),
    used_at TIMESTAMP DEFAULT NOW()
);


