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

// Se llama cuando un jugador efectivamente pide/ve esta pista puntual
// (GET /api/pistas/:id). "veces_usada" es un contador de uso real, no un
// campo que se edite a mano desde el CRUD de administración.
async function incrementarUso(id) {
  const { rows } = await pool.query(
    'UPDATE pistas SET veces_usada = veces_usada + 1 WHERE id = $1 RETURNING *',
    [id]
  )
  return rows[0] || null
}

async function createPista({ level_id, texto, orden, tipo }) {
  const { rows } = await pool.query(
    `INSERT INTO pistas (level_id, texto, orden, tipo)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [level_id, texto, orden, tipo || 'texto']
  )
  return rows[0]
}

async function updatePista(id, { texto, orden, tipo }) {
  const { rows } = await pool.query(
    `UPDATE pistas
     SET texto = $1, orden = $2, tipo = $3
     WHERE id = $4 RETURNING *`,
    [texto, orden, tipo || 'texto', id]
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
  incrementarUso,
  createPista,
  updatePista,
  deletePista,
}
