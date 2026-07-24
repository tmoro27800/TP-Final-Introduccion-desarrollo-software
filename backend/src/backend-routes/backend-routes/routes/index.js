const express = require('express')

const router = express.Router()

router.use('/dificultad', require('./dificultad.routes'))
router.use('/levels', require('./levels.routes'))
router.use('/scores', require('./scores.routes'))
router.use('/pistas', require('./pistas.routes'))
router.use('/powerups', require('./powerups.routes'))
router.use('/pistas-usadas', require('./pistasUsadas.routes'))
router.use('/powerups-usados', require('./powerupsUsados.routes'))

module.exports = router
