const pool = require('../pool')

// getAllLevels(dificultad) — si se pasa, filtra por el NOMBRE de la
// dificultad ("normal" / "dificil", case-insensitive), no por id numérico
// — así es como lo manda el frontend (SelectionMode.jsx navega a
// /seleccion-nivel/normal o /dificil, y ese string es el que viaja tal
// cual hasta acá).
// Se agregan los alias "nombre" y "mapa" junto a "name"/"layout" porque el
// frontend (mocks de Niveles.mock.json / NivelesDetalle.mock.json) todavía
// espera esos nombres.
async function getAllLevels(dificultad) {
  const params = []
  let where = ''
  if (dificultad) {
    params.push(dificultad)
    where = 'WHERE LOWER(d.nombre) = LOWER($1)'
  }

  const { rows } = await pool.query(
    `
    SELECT l.id, l.name, l.name AS nombre, l.order_index, l.layout, l.layout AS mapa,
           l.dificultad_id, l.created_at,
           d.nombre AS dificultad_nombre
    FROM levels l
    LEFT JOIN dificultad d ON d.id = l.dificultad_id
    ${where}
    ORDER BY l.order_index ASC
    `,
    params
  )
  return rows
}

async function getLevelById(id) {
  const { rows } = await pool.query(
    `
    SELECT l.id, l.name, l.name AS nombre, l.order_index, l.layout, l.layout AS mapa,
           l.dificultad_id, l.created_at,
           d.nombre AS dificultad_nombre
    FROM levels l
    LEFT JOIN dificultad d ON d.id = l.dificultad_id
    WHERE l.id = $1
    `,
    [id]
  )
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
