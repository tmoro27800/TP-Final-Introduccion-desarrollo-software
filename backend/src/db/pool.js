require('dotenv').config()
const { Pool } = require('pg')

// Un solo pool de conexiones para todo el backend — no se crea una
// conexión nueva por cada query, pg las reutiliza automáticamente.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'puzzle_game',
})

module.exports = pool
