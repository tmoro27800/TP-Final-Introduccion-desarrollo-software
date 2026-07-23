const pool = require('../pool')

async function getAllDificultades() {
  const { rows } = await pool.query(
    'SELECT id, nombre, orden FROM dificultad ORDER BY orden ASC'
  )
  return rows
}

async function getDificultadById(id) {
  const { rows } = await pool.query(
    'SELECT id, nombre, orden FROM dificultad WHERE id = $1',
    [id]
  )
  return rows[0] || null
}

async function createDificultad({ nombre, orden }) {
  const { rows } = await pool.query(
    'INSERT INTO dificultad (nombre, orden) VALUES ($1, $2) RETURNING *',
    [nombre, orden]
  )
  return rows[0]
}

async function updateDificultad(id, { nombre, orden }) {
  const { rows } = await pool.query(
    'UPDATE dificultad SET nombre = $1, orden = $2 WHERE id = $3 RETURNING *',
    [nombre, orden, id]
  )
  return rows[0] || null
}

async function deleteDificultad(id) {
  const { rowCount } = await pool.query('DELETE FROM dificultad WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllDificultades,
  getDificultadById,
  createDificultad,
  updateDificultad,
  deleteDificultad,
}
