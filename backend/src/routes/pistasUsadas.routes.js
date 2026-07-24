const express = require('express')
const { pistasUsadas } = require('../db/queries')

const router = express.Router()

router.get('/score/:score_id', async (req, res) => {
  try {
    const data = await pistasUsadas.getPistasUsadasByScore(req.params.score_id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await pistasUsadas.getAllPistasUsadas()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await pistasUsadas.getPistaUsadaById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { score_id, pista_id } = req.body
    const data = await pistasUsadas.registerPistaUsada(score_id, pista_id)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { score_id, pista_id } = req.body
    const data = await pistasUsadas.updatePistaUsada(req.params.id, { score_id, pista_id })
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await pistasUsadas.deletePistaUsada(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
