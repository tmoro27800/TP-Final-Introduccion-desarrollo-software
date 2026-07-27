const pool = require('../pool')

// "nombre" es el slug que viaja por toda la API como valor de "dificultad"
// (normal/dificil — minúsculas, sin espacios). "nombre_visible" es el
// texto para mostrar en pantalla ("Normal", "Dificil").
// El contrato (GET /api/dificultades) pide {id, nombre} donde "id" es el
// slug y "nombre" es el texto visible — por eso getAllDificultadesContrato()
// devuelve las columnas renombradas así.

async function getAllDificultades() {
  const { rows } = await pool.query(
    'SELECT id, nombre, nombre_visible, orden FROM dificultad ORDER BY orden ASC'
  )
  return rows
}

// Shape exacto que pide el API Contract: [{ id: "normal", nombre: "Normal" }, ...]
async function getAllDificultadesContrato() {
  const { rows } = await pool.query(
    'SELECT nombre AS id, nombre_visible AS nombre FROM dificultad ORDER BY orden ASC'
  )
  return rows
}

async function getDificultadById(id) {
  const { rows } = await pool.query(
    'SELECT id, nombre, nombre_visible, orden FROM dificultad WHERE id = $1',
    [id]
  )
  return rows[0] || null
}

// Para resolver el slug ("normal"/"dificil") al id numérico interno,
// usado por levels/puntajes al filtrar o al guardar un puntaje nuevo.
async function getDificultadByNombre(nombre) {
  const { rows } = await pool.query(
    'SELECT id, nombre, nombre_visible, orden FROM dificultad WHERE LOWER(nombre) = LOWER($1)',
    [nombre]
  )
  return rows[0] || null
}

async function createDificultad({ nombre, nombre_visible, orden }) {
  const { rows } = await pool.query(
    'INSERT INTO dificultad (nombre, nombre_visible, orden) VALUES ($1, $2, $3) RETURNING *',
    [nombre, nombre_visible, orden]
  )
  return rows[0]
}

async function updateDificultad(id, { nombre, nombre_visible, orden }) {
  const { rows } = await pool.query(
    'UPDATE dificultad SET nombre = $1, nombre_visible = $2, orden = $3 WHERE id = $4 RETURNING *',
    [nombre, nombre_visible, orden, id]
  )
  return rows[0] || null
}

async function deleteDificultad(id) {
  const { rowCount } = await pool.query('DELETE FROM dificultad WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllDificultades,
  getAllDificultadesContrato,
  getDificultadById,
  getDificultadByNombre,
  createDificultad,
  updateDificultad,
  deleteDificultad,
}
