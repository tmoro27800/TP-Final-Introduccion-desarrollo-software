const express = require('express')

const router = express.Router()

// Convención definitiva del equipo: todo en español.
// /dificultad, /levels y /scores quedan como alias en inglés/viejos por
// compatibilidad — no implementan el API Contract nuevo, son las rutas
// "viejas" que ya existían. Los canónicos son /dificultades, /niveles
// y /puntajes.
router.use('/dificultad', require('./dificultad.routes'))
router.use('/dificultades', require('./dificultad.routes'))

router.use('/levels', require('./levels.routes'))
router.use('/niveles', require('./levels.routes'))

router.use('/scores', require('./scores.routes'))
router.use('/puntajes', require('./puntajes.routes'))

router.use('/pistas', require('./pistas.routes'))
router.use('/powerups', require('./powerups.routes'))

module.exports = router
