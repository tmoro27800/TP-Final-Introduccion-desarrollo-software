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

-- 35 niveles (20 normal + 15 dificil), diseñados por un compañero del
-- equipo. Reemplazan por completo al set anterior (más chico, de prueba).
-- Se remapearon dos valores respecto del archivo original: en esa
-- convención 8=lava y 9=vacío, pero acá esos números ya significan otra
-- cosa (9=láser, 8 descartado) — quedaron como 13 (LAVA) y 15 (VACIO),
-- que es lo que usa el resto del proyecto (ver tiposCelda.js). También se
-- corrigieron 2 niveles que llegaron rotos: el Nivel 4 no tenía meta (el
-- segundo jugador "2" se corrigió a meta "3", un diseño tipo caja-vault)
-- y el Nivel 30 tampoco (comparado con el Nivel 29, casi idéntico, la
-- esquina inferior izquierda debía ser la meta). Quedó pendiente avisarle
-- al compañero: en 10 niveles (20, 25, 26, 27, 29-35) el valor 7
-- (teletransportador) aparece una sola vez en vez de en pares — no rompe
-- nada (un portal sin par simplemente no hace nada al pisarlo), pero
-- probablemente falta el segundo.
INSERT INTO levels (name, order_index, dificultad_id, layout) VALUES
    ('Nivel 1', 1, 1, '[[1,1,1,1,1,1,1],[1,2,0,0,0,0,1],[1,0,0,0,0,0,1],[1,0,0,0,0,0,1],[1,0,0,0,0,0,1],[1,0,0,0,1,3,1]]'),
    ('Nivel 2', 2, 1, '[[1,1,1,1,1,1,1,1],[1,2,0,0,0,0,0,1],[1,0,0,1,0,0,0,1],[1,1,0,0,0,0,0,1],[1,0,0,0,1,0,0,1],[1,1,1,0,1,0,0,1],[1,0,0,0,0,1,0,1],[1,1,3,1,0,1,0,1]]'),
    ('Nivel 3', 3, 1, '[[1,1,1,1,1,1,1,1,1],[1,2,0,0,0,0,1,0,1],[1,0,0,0,1,0,0,0,1],[1,0,0,1,0,0,1,3,1],[1,1,1,1,1,1,1,1,1]]'),
    ('Nivel 4', 4, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,1],[1,0,0,4,0,0,0,0,0,1],[1,0,3,4,0,0,0,0,0,1],[1,0,0,4,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1]]'),
    ('Nivel 5', 5, 1, '[[1,1,1,1,1,1],[1,2,0,1,0,1],[1,0,0,0,0,1],[1,0,1,0,3,1],[1,1,1,1,1,1]]'),
    ('Nivel 6', 6, 1, '[[1,1,1,1,1,1],[1,2,0,1,0,1],[1,0,0,0,0,1],[1,0,1,0,4,1],[1,0,4,0,1,0],[1,0,3,0,1,0]]'),
    ('Nivel 7', 7, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,1,0,0,0,0,1],[1,0,0,0,1,0,4,0,4,1],[1,0,2,0,1,0,0,0,0,1],[1,0,0,4,1,0,0,0,3,1],[1,1,1,0,0,0,1,1,1,1]]'),
    ('Nivel 8', 8, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,4,0,0,0,0,1],[1,4,1,0,0,4,0,4,0,1],[1,0,4,1,0,0,0,0,0,1],[1,0,1,0,4,0,0,0,0,1],[1,1,1,1,1,1,0,1,1,1],[1,0,0,0,0,0,0,0,3,1]]'),
    ('Nivel 9', 9, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,5,0,1,0,0,0,1],[1,1,1,0,1,1,5,1,0,1],[1,0,0,1,0,1,1,1,1,1],[1,0,1,0,0,1,0,3,0,1],[1,1,1,1,1,1,1,1,1,1]]'),
    ('Nivel 10', 10, 1, '[[1,1,1,1,1,1,1],[1,2,1,1,4,1,1],[1,5,0,1,0,1,1],[1,0,4,0,3,1,1],[1,1,0,0,4,1,1]]'),
    ('Nivel 11', 11, 1, '[[1,1,1,1,1,1,1,1,1],[1,2,0,0,0,0,0,1,1],[1,0,0,0,1,0,1,1,1],[1,1,0,0,1,0,6,1,1],[1,0,1,1,0,0,1,1,1],[1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,1],[1,1,3,1,0,0,6,1,1]]'),
    ('Nivel 12', 12, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,4,1,1,0,6,1],[1,4,1,0,0,4,0,4,0,1],[1,0,4,1,0,0,5,1,0,1],[1,0,1,0,4,0,1,1,0,1],[1,1,1,1,1,1,1,1,1,1],[1,6,0,5,0,0,1,0,3,1]]'),
    ('Nivel 13', 13, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,4,0,0,0,0,1],[1,4,1,0,13,4,0,4,0,1],[1,0,4,0,0,0,0,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,0,1,1,1],[1,0,0,0,0,0,0,0,3,1]]'),
    ('Nivel 14', 14, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,13,13,4,0,13,1],[1,13,1,0,0,0,0,4,0,1],[1,0,4,1,13,1,0,13,0,1],[1,0,1,0,4,0,0,0,0,1],[1,1,1,1,1,1,3,1,1,1]]'),
    ('Nivel 15', 15, 1, '[[1,1,1,1,1,1,1],[1,2,1,1,4,1,1],[1,0,0,0,15,1,1],[1,1,15,0,3,1,1],[1,1,0,0,4,1,1]]'),
    ('Nivel 16', 16, 1, '[[1,1,1,1,1,1,1],[1,2,1,1,4,1,1],[1,5,0,1,0,1,1],[1,0,4,0,0,1,1],[1,1,0,15,4,1,1],[1,15,0,0,0,3,1]]'),
    ('Nivel 17', 17, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,4,0,0,10,0,1],[1,4,1,0,13,4,0,4,0,1],[1,0,4,0,0,0,0,10,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,0,1,1,1],[1,0,0,10,0,0,0,0,3,1]]'),
    ('Nivel 18', 18, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,4,0,0,10,0,1],[1,4,1,0,13,4,0,4,0,1],[1,0,4,0,0,0,0,15,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,0,1,1,1],[1,0,0,10,0,0,0,0,3,1]]'),
    ('Nivel 19', 19, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,0,0,0,0,1],[1,0,0,0,1,0,0,0,0,1],[1,4,1,0,0,4,0,4,0,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,4,1,1,1],[1,0,0,0,0,0,0,0,3,1]]'),
    ('Nivel 20', 20, 1, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,0,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,4,1,1,1],[10,0,0,7,0,0,0,0,3,1]]'),
    ('Nivel 21', 21, 2, '[[1,1,1,1,1,1,1],[1,2,1,5,4,13,6],[1,0,0,0,15,1,1],[1,6,10,0,11,3,1],[1,1,13,0,4,10,1]]'),
    ('Nivel 22', 22, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,0,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,4,1,1,1],[10,0,0,0,0,0,0,0,3,1]]'),
    ('Nivel 23', 23, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,6,10,0,15,0,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,1,1,1,4,1,1,1],[10,0,6,0,4,0,0,11,3,1]]'),
    ('Nivel 24', 24, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,6,15,0,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,7,0,1],[1,1,1,1,1,1,4,1,1,1],[10,7,0,0,0,0,6,15,3,1]]'),
    ('Nivel 25', 25, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,6,0,10,0,15,0,1],[1,0,0,0,1,0,0,5,10,1],[1,15,1,0,0,4,0,4,10,1],[1,13,4,0,0,0,11,0,15,1],[1,6,1,13,4,13,0,7,0,1],[1,1,1,1,1,1,4,1,1,1],[10,0,0,0,0,0,0,13,3,1]]'),
    ('Nivel 26', 26, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,6,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,6,13,1,4,1,1,1],[10,13,0,0,0,1,5,0,15,1],[0,11,0,7,0,0,1,0,4,3]]'),
    ('Nivel 27', 27, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,6,0,10,0,15,6,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,5,0,11,0,0,1],[1,0,1,13,4,6,15,0,0,1],[1,1,1,6,13,1,4,1,1,1],[10,13,0,7,0,1,5,0,15,1],[0,11,0,0,0,0,1,0,4,3]]'),
    ('Nivel 28', 28, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,4,0,15,6,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,10,1,13,4,13,0,0,3,1],[1,1,7,6,13,1,4,1,1,1],[10,13,0,4,0,1,5,0,15,1],[0,11,0,7,0,0,1,0,4,10]]'),
    ('Nivel 29', 29, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,10,1],[1,0,0,6,1,0,0,5,1,1],[1,5,1,0,0,4,0,4,0,1],[1,0,4,0,0,0,11,0,0,1],[1,10,1,13,4,13,0,0,0,1],[1,1,1,6,13,1,4,1,1,1],[6,13,0,0,0,1,5,0,15,1],[3,11,0,7,0,0,1,0,4,10]]'),
    ('Nivel 30', 30, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,0,1],[1,0,1,0,1,0,0,5,1,1],[1,5,1,13,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,6,1,13,4,13,0,0,0,1],[1,1,1,6,13,1,4,1,10,1],[10,13,0,15,0,1,5,0,15,1],[3,11,0,7,13,0,1,6,4,11]]'),
    ('Nivel 31', 31, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,6,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,3,1,13,4,13,0,0,0,1],[1,1,1,10,13,1,4,1,1,1],[6,13,0,0,0,1,5,0,15,1],[0,11,0,7,0,0,1,0,4,10]]'),
    ('Nivel 32', 32, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,6,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,3,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,10,1],[1,1,1,6,13,1,4,1,1,1],[10,13,0,0,0,1,5,0,15,1],[0,11,0,7,0,10,1,0,4,0]]'),
    ('Nivel 33', 33, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,0,1],[1,0,0,0,1,0,0,5,1,1],[1,5,1,15,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,6,1,13,4,13,0,0,0,1],[1,1,1,10,13,1,4,1,1,1],[10,13,0,0,0,1,5,0,15,1],[3,11,0,7,0,0,1,0,4,6]]'),
    ('Nivel 34', 34, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,3,0,10,0,15,6,1],[1,0,0,0,1,0,0,5,1,1],[1,4,1,0,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,6,13,1,4,1,1,1],[10,13,0,0,0,1,5,0,15,1],[0,11,0,7,0,0,1,0,4,10]]'),
    ('Nivel 35', 35, 2, '[[1,1,1,1,1,1,1,1,1,1],[1,2,1,0,0,10,0,15,6,1],[1,0,0,5,1,0,15,5,1,1],[1,4,1,15,0,4,0,4,10,1],[1,0,4,0,0,0,11,0,0,1],[1,0,1,13,4,13,0,0,0,1],[1,1,1,6,13,1,4,1,1,1],[10,13,0,0,0,1,5,0,15,1],[0,11,0,7,15,0,1,0,4,3]]'),
    -- Nivel de prueba: una "sala de mecánicas" al final de Dificil (order_index
    -- 36, después del Nivel 35) para poder probar TODAS las mecánicas
    -- implementadas en un solo lugar en vez de tener que buscarlas repartidas
    -- entre los 35 niveles de diseño. Es un cuarto abierto con 7 "estaciones"
    -- conectadas por un corredor central (columna 11), una por fila: fantasma
    -- (con un bolsillo sellado que solo se cruza saltando una pared, y un
    -- segundo pickup adentro para poder saltar de vuelta), pinchos+invulnerabilidad
    -- +láser, botón+puerta+lava, caja+placa de presión+puerta, puente+caja
    -- empujada al vacío+fuerza+caja para destruir+un par de teletransportadores
    -- (entre esta fila y la de pinchos/láser), llave+puerta con llave, y la
    -- meta al final (como la puerta con llave, exige juntar las 2 llaves).
    ('Sala de Mecanicas', 36, 2, '[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,2,0,5,0,1,16,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,6,0,0,0,10,0,0,0,0,0,0,0,9,0,0,0,7,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,11,0,12,0,0,0,0,0,0,0,13,13,13,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,4,17,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,14,14,14,0,0,0,4,15,0,0,18,0,4,0,0,0,7,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,16,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]');

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

--4. consejos
-- Antes se llamaba "pistas". Consejos progresivos por nivel: el frontend
-- los pide todos juntos (ordenados por "orden") y los va revelando de a
-- uno en la misma ventana modal (ver
-- frontend/src/juego/Consejos/useConsejos.js) — no hace falta pedirlos
-- de a uno al backend, así que no hay contador de uso: se reemplazó por
-- "creado_en", un timestamp que se llena solo (mismo criterio que
-- levels.created_at/scores.completed_at).

CREATE TABLE consejos (
    id SERIAL PRIMARY KEY,
    -- a diferencia de la vieja "pistas", acá SÍ es obligatorio: un consejo
    -- sin nivel no tiene sentido, es justamente la idea "uno por nivel".
    level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    texto VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL,
    -- tipo de consejo: hoy solo se usa "texto" (mensaje simple). Reservado
    -- para variantes futuras ("resaltado" = marcar una celda del mapa,
    -- "camino" = sugerir la próxima dirección), que necesitarían columnas
    -- extra (qué celda, qué dirección) que todavía no existen.
    tipo VARCHAR(30) NOT NULL DEFAULT 'texto',
    creado_en TIMESTAMP DEFAULT NOW(),
    -- evita cargar dos consejos del mismo nivel con el mismo número de orden
    UNIQUE (level_id, orden)
);

-- Consejos progresivos por nivel: el primero es vago, el último casi
-- resuelve el paso.

-- Nivel 1 (id 1, normal): laberinto simple de paredes, sin mecánicas.
INSERT INTO consejos (level_id, texto, orden) VALUES
    (1, 'El camino más corto no siempre es el más directo — a veces hay que rodear.', 1),
    (1, 'Fijate bien en las paredes que forman una L cerca de la meta.', 2);

-- Nivel 2 (id 2, normal): laberinto simple de paredes, sin mecánicas.
INSERT INTO consejos (level_id, texto, orden) VALUES
    (2, 'La meta está más lejos de lo que parece a simple vista, tomate tu tiempo.', 1),
    (2, 'Bordeá por abajo antes de subir hacia la meta.', 2);

-- Nivel 3 (id 3, dificil): llave -> caja -> fantasma -> lava -> fuerza -> teletransportador -> meta.
INSERT INTO consejos (level_id, texto, orden) VALUES
    (3, 'Empezá por la llave, la vas a necesitar para poder pisar la meta.', 1),
    (3, 'La caja no se cruza de frente — hay que bordearla y empujarla desde otro lado.', 2),
    (3, 'El modo fantasma solo atraviesa UNA pared, y solo si el otro lado es transitable.', 3),
    (3, 'Guardate la invulnerabilidad para la lava, no la gastes antes de tiempo.', 4),
    (3, 'Los dos teletransportadores te ahorran cruzar toda la lava de nuevo si volvés para atrás.', 5);

-- Nivel 4 (id 4, dificil): galería lineal, una estación por mecánica.
INSERT INTO consejos (level_id, texto, orden) VALUES
    (4, 'Agarrá la invulnerabilidad apenas arranques, la vas a necesitar pronto.', 1),
    (4, 'El láser cicla cada 3 movimientos — contá el ritmo antes de cruzar.', 2),
    (4, 'Hay un desvío para empujar una caja sobre una placa de presión y abrir una puerta.', 3),
    (4, 'El botón, a diferencia de la placa, queda presionado para siempre.', 4),
    (4, 'El puente colapsa 5 movimientos después de pisarlo por primera vez — no te quedes parado ahí.', 5);

-- Nivel 5 (id 5, dificil): no lineal, con desvíos y decisiones genuinas.
INSERT INTO consejos (level_id, texto, orden) VALUES
    (5, 'Empujá la primera caja hacia la alcoba de arriba para destrabar una llave escondida.', 1),
    (5, 'El fantasma solo atraviesa hacia un lado — del otro lado hay pared doble a propósito.', 2),
    (5, 'Los pinchos no matan, solo penalizan movimientos — a veces cruzarlos de frente sale más barato que el desvío.', 3),
    (5, 'Guardate la invulnerabilidad para más adelante, no la gastes en los pinchos.', 4),
    (5, 'Si no querés arriesgarte con la lava, un teletransportador te rodea gratis.', 5);


-- Nivel 6 (id 6, dificil): todas las mecánicas, incluida la puerta con llave.
INSERT INTO consejos (level_id, texto, orden) VALUES
    (6, 'Hacen falta las DOS llaves del nivel para que la puerta con llave se abra sola.', 1),
    (6, 'El botón de este nivel es solo para practicar la mecánica, no hace falta para avanzar.', 2),
    (6, 'Guardate el modo Fuerza para la segunda caja, o empujala directo al vacío si preferís.', 3),
    (6, 'Con las dos llaves ya juntadas, la puerta con llave se abre sola al acercarte — no hace falta hacer nada especial.', 4);

--5. obstaculos
-- Glosario de las mecánicas del juego (antes era "powerups", una tabla de
-- catálogo que nunca se llegó a usar desde el frontend). Reemplazada por
-- esta: una fila por cada mecánica del tablero, para que el modal "Cómo
-- jugar > Mecánicas" del frontend arme su lista con datos reales en vez de
-- un array hardcodeado (ver frontend/src/juego/Menu/mecanicasInfo.js).

CREATE TABLE obstaculos (
    id SERIAL PRIMARY KEY,
    -- slug interno (minúsculas, sin espacios) para que el frontend lo
    -- empareje con su sprite local — ver mecanicasInfo.js: NOMBRE_A_VALOR.
    nombre VARCHAR(50) NOT NULL UNIQUE,
    nombre_visible VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    -- agrupa la mecánica: terreno | objeto | pickup | peligro | mecanismo
    tipo VARCHAR(30) NOT NULL,
    -- orden de lectura en el glosario (mismo criterio "recorrido" que tenía
    -- el array hardcodeado: lo básico primero, pickups, peligros, portal,
    -- mecánicas interactivas al final)
    orden INTEGER NOT NULL,
    -- dificultad mínima en la que aparece esta mecánica; NULL = en todas
    dificultad_id INTEGER REFERENCES dificultad(id)
);

INSERT INTO obstaculos (nombre, nombre_visible, descripcion, tipo, orden, dificultad_id) VALUES
    ('piso', 'Piso', 'Espacio libre. Se camina sin restricciones.', 'terreno', 1, NULL),
    ('pared', 'Pared', 'Bloquea el paso. Con Fantasma activo se puede atravesar una.', 'terreno', 2, NULL),
    ('meta', 'Meta', 'Objetivo del nivel. No se puede pisar si todavía quedan llaves sin recoger.', 'terreno', 3, NULL),
    ('caja', 'Caja', 'Se empuja moviéndose contra ella. No se puede empujar sobre otra caja ni sobre un obstáculo sólido.', 'objeto', 4, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('llave', 'Llave', 'Se recoge al pisarla. Hacen falta todas para poder pisar la meta.', 'objeto', 5, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('fantasma', 'Modo fantasma', 'Pickup. El siguiente paso puede atravesar una pared, si la celda de después es transitable.', 'pickup', 6, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('invulnerabilidad', 'Invulnerabilidad', 'Pickup. Protege de morir en el próximo peligro (lava o pinchos); se consume al usarse.', 'pickup', 7, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('fuerza', 'Modo fuerza', 'Pickup. El siguiente choque contra una caja la destruye en vez de empujarla.', 'pickup', 8, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('pinchos', 'Pinchos', 'No matan. Pisarlos suma 3 movimientos al contador, salvo con Invulnerabilidad activa.', 'peligro', 9, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('lava', 'Lava', 'Mata al pisarla, salvo con Invulnerabilidad activa.', 'peligro', 10, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('vacio', 'Vacío', 'Muerte instantánea al pisarlo. Si se empuja una caja adentro, la caja se destruye pero se avanza.', 'peligro', 11, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('teletransportador', 'Teletransportador', 'Siempre hay dos en el mapa. Pisar uno manda directo al otro.', 'mecanismo', 12, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('laser', 'Rayo láser', 'Cicla prendido/apagado cada 3 movimientos. Si está prendido al entrar, mata sin excepción.', 'peligro', 13, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('boton', 'Botón', 'Al tocarlo queda presionado para siempre y abre todas las puertas del nivel.', 'mecanismo', 14, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('puerta', 'Puerta', 'Bloquea el paso hasta que se presione algún botón o una caja quede sobre una placa de presión.', 'mecanismo', 15, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('placa_presion', 'Placa de presión', 'Se activa con el peso de una caja (no con el jugador). Abre puertas mientras la caja siga encima.', 'mecanismo', 16, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('puente', 'Puente temporal', 'Al pisarlo por primera vez arranca una cuenta regresiva de 5 movimientos antes de colapsar.', 'peligro', 17, (SELECT id FROM dificultad WHERE nombre = 'dificil')),
    ('puerta_con_llave', 'Puerta con llave', 'Se desbloquea al juntar todas las llaves del nivel, con una animación de apertura.', 'mecanismo', 18, (SELECT id FROM dificultad WHERE nombre = 'dificil'));
