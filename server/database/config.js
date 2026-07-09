const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // <-- Agregado para que lea el .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Opcional: Aumentar el tiempo de espera si la red está lenta
  connectionTimeoutMillis: 10000, 
});

// Prueba la conexión de forma asíncrona
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ ¡Conexión exitosa a Supabase!');
    client.release();
  } catch (err) {
    console.error('❌ Error al conectar:', err.message);
  }
}

testConnection();

module.exports = pool;
