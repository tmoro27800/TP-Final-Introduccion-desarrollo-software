const express = require('express')
const { scores } = require('../db/queries')

const router = express.Router()

// Rutas específicas ANTES que "/:id", para que Express no confunda
// "ranking" o "level" con un id.
router.get('/ranking/global', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20
    const data = await scores.getGlobalRanking(limit)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/level/:level_id/top', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10
    const data = await scores.getTopScoresByLevel(req.params.level_id, limit)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await scores.getAllScores()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await scores.getScoreById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { level_id, player_name, moves, time_seconds } = req.body
    const data = await scores.createScore({ level_id, player_name, moves, time_seconds })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { player_name, moves, time_seconds } = req.body
    const data = await scores.updateScore(req.params.id, { player_name, moves, time_seconds })
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await scores.deleteScore(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
