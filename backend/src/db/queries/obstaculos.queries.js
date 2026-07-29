const pool = require('../pool')

// "obstaculos" es el glosario de mecánicas del tablero (ex "powerups",
// tabla que nunca se llegó a usar desde el frontend y fue reemplazada).
// Una fila por mecánica (piso, pared, lava, láser, etc.), para que el
// modal "Cómo jugar > Mecánicas" del frontend arme su lista con datos
// reales en vez de un array hardcodeado (ver
// frontend/src/juego/Menu/mecanicasInfo.js y servicios/obstaculoServicio.js).

async function getAllObstaculos() {
  const { rows } = await pool.query('SELECT * FROM obstaculos ORDER BY orden ASC')
  return rows
}

async function getObstaculoById(id) {
  const { rows } = await pool.query('SELECT * FROM obstaculos WHERE id = $1', [id])
  return rows[0] || null
}

async function createObstaculo({ nombre, nombre_visible, descripcion, tipo, orden, dificultad_id }) {
  const { rows } = await pool.query(
    `INSERT INTO obstaculos (nombre, nombre_visible, descripcion, tipo, orden, dificultad_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [nombre, nombre_visible, descripcion, tipo, orden, dificultad_id || null]
  )
  return rows[0]
}

async function updateObstaculo(id, { nombre, nombre_visible, descripcion, tipo, orden, dificultad_id }) {
  const { rows } = await pool.query(
    `UPDATE obstaculos
     SET nombre = $1, nombre_visible = $2, descripcion = $3, tipo = $4, orden = $5, dificultad_id = $6
     WHERE id = $7 RETURNING *`,
    [nombre, nombre_visible, descripcion, tipo, orden, dificultad_id || null, id]
  )
  return rows[0] || null
}

async function deleteObstaculo(id) {
  const { rowCount } = await pool.query('DELETE FROM obstaculos WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllObstaculos,
  getObstaculoById,
  createObstaculo,
  updateObstaculo,
  deleteObstaculo,
}
