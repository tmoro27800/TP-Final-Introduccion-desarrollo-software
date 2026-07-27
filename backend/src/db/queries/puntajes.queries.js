const pool = require('../pool')

// Todo puntaje pertenece siempre a un nivel (no hay modo libre), así que
// la dificultad se saca por join con levels/dificultad — no hace falta
// una columna dificultad_id propia en scores.
//
// Nombres de campo en la respuesta: los del API Contract
// (jugador/movimientos/tiempo), no los de la columna de Postgres.

async function createPuntaje({ level_id, player_name, moves, time_seconds }) {
  const { rows } = await pool.query(
    `INSERT INTO scores (level_id, player_name, moves, time_seconds)
     VALUES ($1, $2, $3, $4)
     RETURNING id, level_id AS nivel, player_name AS jugador,
               moves AS movimientos, time_seconds AS tiempo, completed_at`,
    [level_id, player_name, moves, time_seconds]
  )
  return rows[0]
}

// getPuntajesFiltered({ level_id, dificultad_id }) — level_id es obligatorio
// en la práctica (todo puntaje tiene nivel); dificultad_id es un filtro
// adicional opcional (por las dudas, aunque un nivel ya tiene una sola
// dificultad fija).
async function getPuntajesFiltered({ level_id, dificultad_id } = {}) {
  const conditions = []
  const params = []

  if (level_id) {
    params.push(level_id)
    conditions.push(`s.level_id = $${params.length}`)
  }
  if (dificultad_id) {
    params.push(dificultad_id)
    conditions.push(`l.dificultad_id = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(
    `
    SELECT s.player_name AS jugador, s.moves AS movimientos, s.time_seconds AS tiempo
    FROM scores s
    JOIN levels l ON l.id = s.level_id
    ${where}
    ORDER BY s.moves ASC, s.time_seconds ASC
    `,
    params
  )
  return rows
}

module.exports = { createPuntaje, getPuntajesFiltered }
