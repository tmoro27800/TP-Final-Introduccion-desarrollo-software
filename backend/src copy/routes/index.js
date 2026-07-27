const express = require('express')

const router = express.Router()

// Recursos con alias en español/inglés para que el frontend pueda pegarle
// con cualquiera de los dos nombres mientras el equipo termina de definir
// una única convención (ver routes/README.md).
router.use('/dificultad', require('./dificultad.routes'))
router.use('/dificultades', require('./dificultad.routes'))

router.use('/levels', require('./levels.routes'))
router.use('/niveles', require('./levels.routes'))

router.use('/scores', require('./scores.routes'))
router.use('/pistas', require('./pistas.routes'))
router.use('/powerups', require('./powerups.routes'))

module.exports = router
