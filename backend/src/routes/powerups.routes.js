const express = require('express')
const { powerups } = require('../db/queries')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = await powerups.getAllPowerups()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await powerups.getPowerupById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, tipo, valor, dificultad_id } = req.body
    if (!nombre || !tipo) {
      return res.status(400).json({ error: 'Faltan campos: "nombre" y "tipo" son obligatorios' })
    }
    const data = await powerups.createPowerup({ nombre, descripcion, tipo, valor, dificultad_id })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, tipo, valor, dificultad_id } = req.body
    const data = await powerups.updatePowerup(req.params.id, {
      nombre,
      descripcion,
      tipo,
      valor,
      dificultad_id,
    })
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await powerups.deletePowerup(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
