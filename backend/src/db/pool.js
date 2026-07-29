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

// Sin esto, un cliente inactivo del pool que pierde la conexión con
// Postgres (ej. el contenedor de la base reiniciando, un hipo de red)
// emite un "error" a nivel de proceso — y si nadie lo escucha, Node lo
// trata como excepción no capturada y TIRA ABAJO TODO EL SERVIDOR,
// cortando cualquier pedido en curso sin mandar respuesta (el navegador
// lo ve como net::ERR_EMPTY_RESPONSE). Ver https://node-postgres.com/apis/pool
// ("Error Handling"). Solo logueamos: el pool ya reemplaza el cliente roto
// solo, no hace falta ninguna acción más.
pool.on('error', (err) => {
  console.error('❌ Error inesperado en un cliente inactivo del pool de Postgres:', err.message)
})

module.exports = pool
