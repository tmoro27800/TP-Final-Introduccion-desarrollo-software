const pool = require('../pool')

async function getAllPowerups() {
  const { rows } = await pool.query('SELECT * FROM powerups ORDER BY id ASC')
  return rows
}

async function getPowerupById(id) {
  const { rows } = await pool.query('SELECT * FROM powerups WHERE id = $1', [id])
  return rows[0] || null
}

async function createPowerup({ nombre, descripcion, tipo, valor, dificultad_id }) {
  const { rows } = await pool.query(
    `INSERT INTO powerups (nombre, descripcion, tipo, valor, dificultad_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nombre, descripcion, tipo, valor, dificultad_id || null]
  )
  return rows[0]
}

async function updatePowerup(id, { nombre, descripcion, tipo, valor, dificultad_id }) {
  const { rows } = await pool.query(
    `UPDATE powerups
     SET nombre = $1, descripcion = $2, tipo = $3, valor = $4, dificultad_id = $5
     WHERE id = $6 RETURNING *`,
    [nombre, descripcion, tipo, valor, dificultad_id || null, id]
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
