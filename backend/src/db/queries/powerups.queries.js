const pool = require('../pool')

async function registerPowerupUsado(score_id, powerup_id) {
  const { rows } = await pool.query(
    'INSERT INTO powerups_usados (score_id, powerup_id) VALUES ($1, $2) RETURNING *',
    [score_id, powerup_id]
  )
  return rows[0]
}

async function getPowerupUsadoById(id) {
  const { rows } = await pool.query('SELECT * FROM powerups_usados WHERE id = $1', [id])
  return rows[0] || null
}

async function getAllPowerupsUsados() {
  const { rows } = await pool.query('SELECT * FROM powerups_usados ORDER BY used_at DESC')
  return rows
}

async function getPowerupsUsadosByScore(score_id) {
  const { rows } = await pool.query(
    `SELECT pu.id, pu.used_at, p.nombre, p.tipo, p.valor
     FROM powerups_usados pu
     JOIN powerups p ON p.id = pu.powerup_id
     WHERE pu.score_id = $1
     ORDER BY pu.used_at ASC`,
    [score_id]
  )
  return rows
}

async function updatePowerupUsado(id, { score_id, powerup_id }) {
  const { rows } = await pool.query(
    'UPDATE powerups_usados SET score_id = $1, powerup_id = $2 WHERE id = $3 RETURNING *',
    [score_id, powerup_id, id]
  )
  return rows[0] || null
}

async function deletePowerupUsado(id) {
  const { rowCount } = await pool.query('DELETE FROM powerups_usados WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  registerPowerupUsado,
  getPowerupUsadoById,
  getAllPowerupsUsados,
  getPowerupsUsadosByScore,
  updatePowerupUsado,
  deletePowerupUsado,
}
