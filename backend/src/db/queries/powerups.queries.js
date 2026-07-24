const pool = require('../pool')

async function getAllPowerups() {
  const { rows } = await pool.query('SELECT * FROM powerups ORDER BY id ASC')
  return rows
}

async function getPowerupById(id) {
  const { rows } = await pool.query('SELECT * FROM powerups WHERE id = $1', [id])
  return rows[0] || null
}

async function createPowerup({ nombre, tipo, valor }) {
  const { rows } = await pool.query(
    'INSERT INTO powerups (nombre, tipo, valor) VALUES ($1, $2, $3) RETURNING *',
    [nombre, tipo, valor]
  )
  return rows[0]
}

async function updatePowerup(id, { nombre, tipo, valor }) {
  const { rows } = await pool.query(
    'UPDATE powerups SET nombre = $1, tipo = $2, valor = $3 WHERE id = $4 RETURNING *',
    [nombre, tipo, valor, id]
  )
  return rows[0] || null
}

async function deletePowerup(id) {
  const { rowCount } = await pool.query('DELETE FROM powerups WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllPowerups,
  getPowerupById,
  createPowerup,
  updatePowerup,
  deletePowerup,
}
