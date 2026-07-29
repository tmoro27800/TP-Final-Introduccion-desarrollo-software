const pool = require('../pool')

// "consejos" reemplaza a la vieja "pistas". Ahora level_id es obligatorio
// (un consejo sin nivel no tiene sentido) y ya no hay contador de uso
// ("veces_usada"): el frontend pide todos los consejos de un nivel juntos
// y los va revelando de a uno en el cliente (ver
// frontend/src/juego/Consejos/useConsejos.js), así que en vez de contar
// vistas se guarda "creado_en" (timestamp automático).

async function getAllConsejos() {
  const { rows } = await pool.query('SELECT * FROM consejos ORDER BY level_id ASC, orden ASC')
  return rows
}

// Usado por GET /api/consejos?nivel=X — ver
// frontend/src/servicios/consejoServicio.js (getConsejosPorNivel).
async function getConsejosByLevel(levelId) {
  const { rows } = await pool.query(
    'SELECT * FROM consejos WHERE level_id = $1 ORDER BY orden ASC',
    [levelId]
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
     VALUES ($1, $2, $3, COALESCE($4, 'texto')) RETURNING *`,
    [level_id, texto, orden, tipo]
  )
  return rows[0]
}

async function updateConsejo(id, { texto, orden, tipo }) {
  const { rows } = await pool.query(
    `UPDATE consejos
     SET texto = $1, orden = $2, tipo = COALESCE($3, tipo)
     WHERE id = $4 RETURNING *`,
    [texto, orden, tipo, id]
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
