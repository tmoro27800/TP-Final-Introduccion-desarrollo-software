const express = require('express')
const { pistas, levels } = require('../db/queries')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = req.query.nivel
      ? await pistas.getPistasByLevel(req.query.nivel)
      : await pistas.getAllPistas()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/level/:level_id', async (req, res) => {
  try {
    const data = await pistas.getPistasByLevel(req.params.level_id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await pistas.incrementarUso(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { level_id, texto, orden, tipo } = req.body
    if (!level_id || !texto || orden === undefined) {
      return res.status(400).json({
        error: 'Faltan campos: "level_id", "texto" y "orden" son obligatorios',
      })
    }
    const existeNivel = await levels.existsLevel(level_id)
    if (!existeNivel) {
      return res.status(400).json({ error: `level_id inválido: "${level_id}"` })
    }
    const data = await pistas.createPista({ level_id, texto, orden, tipo })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existente = await pistas.getPistaById(req.params.id)
    if (!existente) return res.status(404).json({ error: 'No encontrado' })

    const { texto, orden, tipo } = req.body
    if (!texto || orden === undefined) {
      return res.status(400).json({ error: 'Faltan campos: "texto" y "orden" son obligatorios' })
    }

    const data = await pistas.updatePista(req.params.id, { texto, orden, tipo })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await pistas.deletePista(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
