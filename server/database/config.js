// 🗄️ CONFIGURACIÓN DE BASE DE DATOS - Sistema TurnosAR
// Configuración para PostgreSQL con credenciales desde .env

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'turnos_medicos_db',
  password: process.env.DB_PASSWORD || 'admin123',
  port: parseInt(process.env.DB_PORT) || 5432,
  // Configuraciones adicionales para producción
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // Tiempo de espera para nueva conexión
});

// Eventos del pool
pool.on('connect', () => {
  console.log('🔗 Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función de ayuda para ejecutar consultas
const query = (text, params) => pool.query(text, params);

// Verificar la conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error al conectar a PostgreSQL:', err.stack);
  }
  client.query('SELECT NOW()', (err, res) => {
    release();
    if (err) {
      return console.error('Error al ejecutar consulta de prueba', err.stack);
    }
    console.log('✅ PostgreSQL conectado y respondiendo en:', res.rows[0].now);
  });
});

// Exportar la conexión y el pool para acceso directo (streams)
module.exports = { query, pool };
