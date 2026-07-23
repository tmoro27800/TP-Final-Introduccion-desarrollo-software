const pool = require('../pool')

async function getAllLevels() {
  const { rows } = await pool.query(`
    SELECT l.id, l.name, l.order_index, l.layout, l.created_at,
           d.nombre AS dificultad_nombre
    FROM levels l
    LEFT JOIN dificultad d ON d.id = l.dificultad_id
    ORDER BY l.order_index ASC
  `)
  return rows
}

async function getLevelById(id) {
  const { rows } = await pool.query('SELECT * FROM levels WHERE id = $1', [id])
  return rows[0] || null
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

module.exports = { getAllLevels, getLevelById, createLevel, updateLevel, deleteLevel }
