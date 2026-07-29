const pool = require('../pool')

// Consejos progresivos por nivel (antes "pistas"). El frontend los pide
// todos juntos por nivel (getConsejosByLevel, ya ordenados) y los va
// revelando de a uno en el cliente — no hay endpoint de "marcar como
// visto", por eso no hay contador de uso (ver "creado_en" en su lugar,
// un timestamp que se llena solo).

async function getAllConsejos() {
  const { rows } = await pool.query('SELECT * FROM consejos ORDER BY level_id ASC, orden ASC')
  return rows
}

async function getConsejosByLevel(level_id) {
  const { rows } = await pool.query(
    'SELECT * FROM consejos WHERE level_id = $1 ORDER BY orden ASC',
    [level_id]
  )
  return rows
}

async function getConsejoById(id) {
  const { rows } = await pool.query('SELECT * FROM consejos WHERE id = $1', [id])
  return rows[0] || null
}

async function createConsejo({ level_id, texto, orden, tipo }) {
  const { rows } = await pool.query(
    `INSERT INTO consejos (level_id, texto, orden, tipo)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [level_id, texto, orden, tipo || 'texto']
  )
  return rows[0]
}

async function updateConsejo(id, { texto, orden, tipo }) {
  const { rows } = await pool.query(
    `UPDATE consejos
     SET texto = $1, orden = $2, tipo = $3
     WHERE id = $4 RETURNING *`,
    [texto, orden, tipo || 'texto', id]
  )
  return rows[0] || null
}

async function deleteConsejo(id) {
  const { rowCount } = await pool.query('DELETE FROM consejos WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllConsejos,
  getConsejosByLevel,
  getConsejoById,
  createConsejo,
  updateConsejo,
  deleteConsejo,
}
