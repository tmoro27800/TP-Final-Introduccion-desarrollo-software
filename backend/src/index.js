const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor funcionando 🎮')
})

app.use('/api', require('./routes'))

app.listen(PORT, () => {
  console.log(`Servidor trabajando en http://localhost:${PORT}`)
})