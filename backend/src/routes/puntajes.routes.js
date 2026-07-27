const express = require('express')
const { puntajes, dificultad: dificultadQueries, levels } = require('../db/queries')

const router = express.Router()

const JUGADOR_MAX_LEN = 50 // igual al VARCHAR(50) de la columna player_name

// GET /api/puntajes?nivel=<id>&dificultad=<normal|dificil>
// "nivel" es obligatorio (no hay modo libre — todo puntaje pertenece a
// un nivel). "dificultad" es opcional, solo como chequeo extra.
router.get('/', async (req, res) => {
  try {
    const { nivel, dificultad } = req.query

    if (!nivel) {
      return res.status(400).json({ error: 'Falta el parámetro "nivel"' })
    }
    const nivelDb = await levels.getLevelById(nivel)
    if (!nivelDb) {
      return res.status(400).json({ error: `nivel inválido: "${nivel}"` })
    }

    let difId
    if (dificultad) {
      const dif = await dificultadQueries.getDificultadByNombre(dificultad)
      if (!dif) {
        return res.status(400).json({ error: `dificultad inválida: "${dificultad}"` })
      }
      if (nivelDb.dificultad.toLowerCase() !== dif.nombre.toLowerCase()) {
        return res.status(400).json({
          error: `el nivel "${nivel}" no es de dificultad "${dificultad}"`,
        })
      }
      difId = dif.id
    }

    const data = await puntajes.getPuntajesFiltered({ level_id: nivel, dificultad_id: difId })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/puntajes  { nivel, dificultad, jugador, movimientos, tiempo }
router.post('/', async (req, res) => {
  try {
    const { nivel, dificultad, jugador, movimientos, tiempo } = req.body

    if (!nivel) {
      return res.status(400).json({ error: 'Falta "nivel"' })
    }
    const nivelDb = await levels.getLevelById(nivel)
    if (!nivelDb) {
      return res.status(400).json({ error: `nivel inválido: "${nivel}"` })
    }

    if (!dificultad) {
      return res.status(400).json({ error: 'Falta "dificultad"' })
    }
    const dif = await dificultadQueries.getDificultadByNombre(dificultad)
    if (!dif) {
      return res.status(400).json({ error: `dificultad inválida: "${dificultad}"` })
    }
    if (nivelDb.dificultad.toLowerCase() !== dif.nombre.toLowerCase()) {
      return res.status(400).json({
        error: `el nivel "${nivel}" no es de dificultad "${dificultad}"`,
      })
    }

    const jugadorLimpio = typeof jugador === 'string' ? jugador.trim() : ''
    if (!jugadorLimpio) {
      return res.status(400).json({ error: 'Falta "jugador" (nombre del jugador)' })
    }
    if (jugadorLimpio.length > JUGADOR_MAX_LEN) {
      return res.status(400).json({
        error: `"jugador" no puede tener más de ${JUGADOR_MAX_LEN} caracteres`,
      })
    }

    if (!Number.isInteger(movimientos) || movimientos < 0) {
      return res.status(400).json({ error: '"movimientos" tiene que ser un entero >= 0' })
    }
    if (!Number.isInteger(tiempo) || tiempo < 0) {
      return res.status(400).json({ error: '"tiempo" tiene que ser un entero >= 0 (segundos)' })
    }

    const data = await puntajes.createPuntaje({
      level_id: nivel,
      player_name: jugadorLimpio,
      moves: movimientos,
      time_seconds: tiempo,
    })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
