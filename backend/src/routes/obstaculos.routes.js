const express = require('express')
const { obstaculos, dificultad: dificultadQueries } = require('../db/queries')

const router = express.Router()

// GET /api/obstaculos — glosario completo de mecánicas, ordenado (para el
// modal "Cómo jugar > Mecánicas" del frontend, ver mecanicasInfo.js).
router.get('/', async (req, res) => {
  try {
    const data = await obstaculos.getAllObstaculos()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await obstaculos.getObstaculoById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, nombre_visible, descripcion, tipo, orden, dificultad_id } = req.body
    if (!nombre || !nombre_visible || !descripcion || !tipo || orden === undefined) {
      return res.status(400).json({
        error: 'Faltan campos: "nombre", "nombre_visible", "descripcion", "tipo" y "orden" son obligatorios',
      })
    }
    if (dificultad_id !== undefined && dificultad_id !== null) {
      const dif = await dificultadQueries.getDificultadById(dificultad_id)
      if (!dif) {
        return res.status(400).json({ error: `dificultad_id inválido: "${dificultad_id}"` })
      }
    }
    const data = await obstaculos.createObstaculo({ nombre, nombre_visible, descripcion, tipo, orden, dificultad_id })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existente = await obstaculos.getObstaculoById(req.params.id)
    if (!existente) return res.status(404).json({ error: 'No encontrado' })

    const { nombre, nombre_visible, descripcion, tipo, orden, dificultad_id } = req.body
    if (!nombre || !nombre_visible || !descripcion || !tipo || orden === undefined) {
      return res.status(400).json({
        error: 'Faltan campos: "nombre", "nombre_visible", "descripcion", "tipo" y "orden" son obligatorios',
      })
    }
    if (dificultad_id !== undefined && dificultad_id !== null) {
      const dif = await dificultadQueries.getDificultadById(dificultad_id)
      if (!dif) {
        return res.status(400).json({ error: `dificultad_id inválido: "${dificultad_id}"` })
      }
    }

    const data = await obstaculos.updateObstaculo(req.params.id, {
      nombre,
      nombre_visible,
      descripcion,
      tipo,
      orden,
      dificultad_id,
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await obstaculos.deleteObstaculo(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
