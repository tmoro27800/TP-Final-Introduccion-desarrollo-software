const pool = require('../pool')

async function startSession(level_id) {
  const { rows } = await pool.query(
    `INSERT INTO play_sessions (level_id)
     VALUES ($1)
     RETURNING id, level_id, started_at`,
    [level_id]
  )
  return rows[0]
}

async function getSessionById(session_id) {
  const { rows } = await pool.query(
    'SELECT * FROM play_sessions WHERE id = $1',
    [session_id]
  )
  return rows[0] || null
}

async function incrementMuertes(session_id) {
  const { rows } = await pool.query(
    `UPDATE play_sessions
     SET muertes = muertes + 1
     WHERE id = $1
     RETURNING muertes`,
    [session_id]
  )
  return rows[0] || null
}

async function finishSession(session_id) {
  const { rows } = await pool.query(
    `UPDATE play_sessions
     SET finished_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [session_id]
  )
  return rows[0] || null
}

// Por si el backend detecta algo raro (ej. un score sin sesión válida)
async function invalidateSession(session_id) {
  const { rows } = await pool.query(
    'UPDATE play_sessions SET is_valid = false WHERE id = $1 RETURNING *',
    [session_id]
  )
  return rows[0] || null
}

// "Create" de esta tabla es startSession(); acá completamos el resto del CRUD.

async function getAllSessions() {
  const { rows } = await pool.query(
    'SELECT * FROM play_sessions ORDER BY started_at DESC'
  )
  return rows
}

// Update genérico, para un panel de admin que necesite corregir
// cualquier campo a mano (no solo los casos puntuales de arriba).
async function updateSession(id, { finished_at, is_valid, muertes }) {
  const { rows } = await pool.query(
    `UPDATE play_sessions
     SET finished_at = $1, is_valid = $2, muertes = $3
     WHERE id = $4
     RETURNING *`,
    [finished_at, is_valid, muertes, id]
  )
  return rows[0] || null
}

async function deleteSession(id) {
  const { rowCount } = await pool.query('DELETE FROM play_sessions WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  startSession,
  getSessionById,
  getAllSessions,
  incrementMuertes,
  finishSession,
  invalidateSession,
  updateSession,
  deleteSession,
}
