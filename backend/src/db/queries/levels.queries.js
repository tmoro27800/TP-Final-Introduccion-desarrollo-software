const pool = require('../pool')

// Shape del API Contract para el listado: {id, nombre, dificultad}
// (dificultad = el slug, ej. "facil" — sin mapa, para no mandar de más
// en la pantalla de selección de nivel).
async function getAllLevels(dificultad) {
  const params = []
  let where = ''
  if (dificultad) {
    params.push(dificultad)
    where = 'WHERE LOWER(d.nombre) = LOWER($1)'
  }

  const { rows } = await pool.query(
    `
    SELECT l.id, l.name AS nombre, d.nombre AS dificultad
    FROM levels l
    LEFT JOIN dificultad d ON d.id = l.dificultad_id
    ${where}
    ORDER BY l.order_index ASC
    `,
    params
  )
  return rows
}

// Shape del API Contract para el detalle: {id, nombre, dificultad, mapa}
async function getLevelById(id) {
  const { rows } = await pool.query(
    `
    SELECT l.id, l.name AS nombre, d.nombre AS dificultad, l.layout AS mapa
    FROM levels l
    LEFT JOIN dificultad d ON d.id = l.dificultad_id
    WHERE l.id = $1
    `,
    [id]
  )
  return rows[0] || null
}

// Para validar en POST /puntajes que el nivel exista de verdad.
async function existsLevel(id) {
  const { rows } = await pool.query('SELECT 1 FROM levels WHERE id = $1', [id])
  return rows.length > 0
}

async function createLevel({ name, order_index, dificultad_id, layout }) {
  const { rows } = await pool.query(
    `INSERT INTO levels (name, order_index, dificultad_id, layout)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, order_index, dificultad_id, layout]
  )
  return rows[0]
}

async function updateLevel(id, { name, order_index, dificultad_id, layout }) {
  const { rows } = await pool.query(
    `UPDATE levels
     SET name = $1, order_index = $2, dificultad_id = $3, layout = $4
     WHERE id = $5
     RETURNING *`,
    [name, order_index, dificultad_id, layout, id]
  )
  return rows[0] || null
}

async function deleteLevel(id) {
  const { rowCount } = await pool.query('DELETE FROM levels WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  getAllLevels,
  getLevelById,
  existsLevel,
  createLevel,
  updateLevel,
  deleteLevel,
}
