const express = require('express')
const { levels } = require('../db/queries')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = await levels.getAllLevels()
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
    const data = await levels.createLevel({ name, order_index, dificultad_id, layout })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, order_index, dificultad_id, layout } = req.body
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
