const express = require('express')
const { levels } = require('../db/queries')

const router = express.Router()

// El "layout" es la matriz que juega Board.jsx/prepararNivel.js del
// frontend: array de arrays de enteros, donde 0=piso, 1=pared,
// 2=posición inicial del jugador, 3=meta.
function esLayoutValido(layout) {
  return (
    Array.isArray(layout) &&
    layout.length > 0 &&
    layout.every((fila) => Array.isArray(fila) && fila.every((celda) => Number.isInteger(celda)))
  )
}

router.get('/', async (req, res) => {
  try {
    // ?dificultad=<id o nombre> — usado por el frontend para filtrar
    // niveles de una dificultad puntual en la pantalla de selección de nivel.
    const data = await levels.getAllLevels(req.query.dificultad)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await levels.getLevelById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, order_index, dificultad_id, layout } = req.body
    if (!esLayoutValido(layout)) {
      return res.status(400).json({
        error: 'layout inválido: tiene que ser una matriz de enteros (0=piso, 1=pared, 2=jugador, 3=meta)',
      })
    }
    const data = await levels.createLevel({ name, order_index, dificultad_id, layout })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, order_index, dificultad_id, layout } = req.body
    if (layout !== undefined && !esLayoutValido(layout)) {
      return res.status(400).json({
        error: 'layout inválido: tiene que ser una matriz de enteros (0=piso, 1=pared, 2=jugador, 3=meta)',
      })
    }
    const data = await levels.updateLevel(req.params.id, {
      name,
      order_index,
      dificultad_id,
      layout,
    })
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await levels.deleteLevel(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
