const express = require('express')
const cors = require('cors')
const pool = require('./db/pool')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor funcionando 🎮')
})

app.use('/api', require('./routes'))

// Chequeo de conexión a Postgres ANTES de levantar el servidor. Si falla,
// el error más común es "password authentication failed for user X" —
// significa que no existe (o está mal) el archivo backend/.env. Copiá
// backend/.env.example a backend/.env y completá DB_USER/DB_PASSWORD/
// DB_NAME con los datos de TU Postgres local (cada integrante del equipo
// tiene los suyos, por eso .env no se sube al repo).
pool
  .query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor trabajando en http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('\n❌ No se pudo conectar a Postgres:', err.message)
    console.error(
      '   Revisá que exista backend/.env (copiá .env.example a .env) y que\n' +
        '   DB_USER/DB_PASSWORD/DB_NAME coincidan con tu Postgres local.\n' +
        '   También confirmá que el servidor de Postgres esté corriendo y que\n' +
        `   la base "${process.env.DB_NAME || 'puzzle_game'}" exista (correr db/init.sql si no).`
    )
    process.exit(1)
  })