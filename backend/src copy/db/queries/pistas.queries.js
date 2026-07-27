const pool = require('../pool')

async function getAllPistas() {
  const { rows } = await pool.query('SELECT * FROM pistas ORDER BY level_id ASC, orden ASC')
  return rows
}

async function getPistasByLevel(level_id) {
  const { rows } = await pool.query(
    'SELECT * FROM pistas WHERE level_id = $1 ORDER BY orden ASC',
    [level_id]
  )
  return rows
}

async function getPistaById(id) {
  const { rows } = await pool.query('SELECT * FROM pistas WHERE id = $1', [id])
  return rows[0] || null
}

async function createPista({ level_id, texto, orden }) {
  const { rows } = await pool.query(
    'INSERT INTO pistas (level_id, texto, orden) VALUES ($1, $2, $3) RETURNING *',
    [level_id, texto, orden]
  )
  return rows[0]
}

async function updatePista(id, { texto, orden }) {
  const { rows } = await pool.query(
    'UPDATE pistas SET texto = $1, orden = $2 WHERE id = $3 RETURNING *',
    [texto, orden, id]
  )
  return rows[0] || null
}

async function deletePista(id) {
  const { rowCount } = await pool.query('DELETE FROM pistas WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllPistas,
  getPistasByLevel,
  getPistaById,
  createPista,
  updatePista,
  deletePista,
}
