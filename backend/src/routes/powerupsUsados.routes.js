const express = require('express')
const { powerupsUsados } = require('../db/queries')

const router = express.Router()

router.get('/score/:score_id', async (req, res) => {
  try {
    const data = await powerupsUsados.getPowerupsUsadosByScore(req.params.score_id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await powerupsUsados.getAllPowerupsUsados()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await powerupsUsados.getPowerupUsadoById(req.params.id)
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { score_id, powerup_id } = req.body
    const data = await powerupsUsados.registerPowerupUsado(score_id, powerup_id)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { score_id, powerup_id } = req.body
    const data = await powerupsUsados.updatePowerupUsado(req.params.id, {
      score_id,
      powerup_id,
    })
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await powerupsUsados.deletePowerupUsado(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
