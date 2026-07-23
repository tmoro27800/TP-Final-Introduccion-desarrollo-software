const pool = require('../pool')

async function registerPistaUsada(score_id, pista_id) {
  const { rows } = await pool.query(
    'INSERT INTO pistas_usadas (session_id, pista_id) VALUES ($1, $2) RETURNING *',
    [score_id, pista_id]
  )
  return rows[0]
}

async function getPistaUsadaById(id) {
  const { rows } = await pool.query('SELECT * FROM pistas_usadas WHERE id = $1', [id])
  return rows[0] || null
}

async function getAllPistasUsadas() {
  const { rows } = await pool.query('SELECT * FROM pistas_usadas ORDER BY used_at DESC')
  return rows
}

async function getPistasUsadasByScore(score_id) {
  const { rows } = await pool.query(
    `SELECT pu.id, pu.used_at, p.texto, p.orden
     FROM pistas_usadas pu
     JOIN pistas p ON p.id = pu.pista_id
     WHERE pu.score_id = $1
     ORDER BY pu.used_at ASC`,
    [score_id]
  )
  return rows
}

async function updatePistaUsada(id, { score_id, pista_id }) {
  const { rows } = await pool.query(
    `UPDATE pistas_usadas SET score_id = $1, pista_id = $2 WHERE id = $3 RETURNING *`,
    [score_id, pista_id, id]
  )
  return rows[0] || null
}

async function deletePistaUsada(id) {
  const { rowCount } = await pool.query('DELETE FROM pistas_usadas WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  registerPistaUsada,
  getPistaUsadaById,
  getAllPistasUsadas,
  getPistasUsadasByScore,
  updatePistaUsada,
  deletePistaUsada,
}
