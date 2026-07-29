const express = require('express')
const { consejos, levels } = require('../db/queries')

const router = express.Router()

// GET /api/consejos?nivel=<id> — todos los consejos de un nivel, ordenados
// (para revelar de a uno del lado del frontend). Sin "?nivel=", todos.
router.get('/', async (req, res) => {
  try {
    const data = req.query.nivel
      ? await consejos.getConsejosByLevel(req.query.nivel)
      : await consejos.getAllConsejos()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await consejos.getConsejoById(req.params.id)
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
    const data = await consejos.createConsejo({ level_id, texto, orden, tipo })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existente = await consejos.getConsejoById(req.params.id)
    if (!existente) return res.status(404).json({ error: 'No encontrado' })

    const { texto, orden, tipo } = req.body
    if (!texto || orden === undefined) {
      return res.status(400).json({ error: 'Faltan campos: "texto" y "orden" son obligatorios' })
    }

    const data = await consejos.updateConsejo(req.params.id, { texto, orden, tipo })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await consejos.deleteConsejo(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'No encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
