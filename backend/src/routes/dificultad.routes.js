const express = require('express')
const { dificultad } = require('../db/queries')

const router = express.Router()

// GET /api/dificultades — shape exacto del API Contract:
// [{ id: "normal", nombre: "Normal" }, ...]  ("id" es el slug, no el PK numérico)
router.get('/', async (req, res) => {
  try {
    const data = await dificultad.getAllDificultadesContrato()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await dificultad.getDificultadById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, nombre_visible, orden } = req.body
    const data = await dificultad.createDificultad({ nombre, nombre_visible, orden })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { nombre, nombre_visible, orden } = req.body
    const data = await dificultad.updateDificultad(req.params.id, {
      nombre,
      nombre_visible,
      orden,
    })
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await dificultad.deleteDificultad(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
