const pool = require('../pool')

async function createScore({ level_id, player_name, moves, time_seconds }) {
  const { rows } = await pool.query(
    `INSERT INTO scores (level_id, player_name, moves, time_seconds)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [level_id, player_name, moves, time_seconds]
  )
  return rows[0]
}


// Mejores puntajes de UN nivel puntual (ej. "mejores tiempos del nivel 3")
async function getTopScoresByLevel(level_id, limit = 10) {
  const { rows } = await pool.query(
    `SELECT player_name, moves, time_seconds, completed_at
     FROM scores
     WHERE level_id = $1
     ORDER BY moves ASC, time_seconds ASC
     LIMIT $2`,
    [level_id, limit]
  )
  return rows
}

// Ranking global: gana quien llegó más lejos (mayor order_index del nivel),
// y a igual nivel máximo alcanzado, quien lo hizo con menos pasos.
// Esta es la regla de negocio del documento del proyecto.
async function getGlobalRanking(limit = 20) {
  const { rows } = await pool.query(
    `
    WITH nivel_maximo_por_jugador AS (
      SELECT s.player_name, MAX(l.order_index) AS max_nivel
      FROM scores s
      JOIN levels l ON l.id = s.level_id
      GROUP BY s.player_name
    ),
    mejor_puntaje_en_max AS (
      SELECT nmp.player_name, nmp.max_nivel, MIN(s.moves) AS mejores_pasos
      FROM nivel_maximo_por_jugador nmp
      JOIN scores s ON s.player_name = nmp.player_name
      JOIN levels l ON l.id = s.level_id AND l.order_index = nmp.max_nivel
      GROUP BY nmp.player_name, nmp.max_nivel
    )
    SELECT player_name, max_nivel, mejores_pasos
    FROM mejor_puntaje_en_max
    ORDER BY max_nivel DESC, mejores_pasos ASC
    LIMIT $1
    `,
    [limit]
  )
  return rows
}

// Filtro combinado para GET /scores?nivel=<level_id>&dificultad=<nombre>
// (los dos son opcionales e independientes entre sí). "dificultad" es el
// nombre ("normal"/"dificil", case-insensitive), no un id — mismo criterio
// que getAllLevels() en levels.queries.js, porque así es como lo manda
// el frontend.
async function getScoresFiltered({ level_id, dificultad } = {}) {
  const conditions = []
  const params = []

  if (level_id) {
    params.push(level_id)
    conditions.push(`s.level_id = $${params.length}`)
  }
  if (dificultad) {
    params.push(dificultad)
    conditions.push(`LOWER(d.nombre) = LOWER($${params.length})`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `
    SELECT s.*
    FROM scores s
    JOIN levels l ON l.id = s.level_id
    LEFT JOIN dificultad d ON d.id = l.dificultad_id
    ${where}
    ORDER BY s.moves ASC, s.time_seconds ASC
    `,
    params
  )
  return rows
}

async function getScoreById(id) {
  const { rows } = await pool.query('SELECT * FROM scores WHERE id = $1', [id])
  return rows[0] || null
}

async function getAllScores() {
  const { rows } = await pool.query('SELECT * FROM scores ORDER BY completed_at DESC')
  return rows
}

async function updateScore(id, { player_name, moves, time_seconds }) {
  const { rows } = await pool.query(
    `UPDATE scores
     SET player_name = $1, moves = $2, time_seconds = $3
     WHERE id = $4
     RETURNING *`,
    [player_name, moves, time_seconds, id]
  )
  return rows[0] || null
}

async function deleteScore(id) {
  const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  createScore,
  getScoresFiltered,
  getScoreById,
  getAllScores,
  getTopScoresByLevel,
  getGlobalRanking,
  updateScore,
  deleteScore,
}
