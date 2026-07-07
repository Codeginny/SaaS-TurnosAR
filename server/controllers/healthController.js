const { query } = require('../database/config');

/**
 * @typedef {Object} HealthStatus
 * @property {string} message - Mensaje de estado del servidor
 * @property {string} database - Estado de conexión a PostgreSQL
 * @property {string} timestamp - Timestamp ISO de la verificación
 * @property {string} version - Versión del sistema
 * @property {string} architecture - Arquitectura del sistema
 */

/**
 * @typedef {Object} SystemStats
 * @property {number} profesionales - Cantidad de profesionales registrados
 * @property {number} pacientes - Cantidad de pacientes registrados
 * @property {string} timestamp - Timestamp ISO de la consulta
 */

/**
 * Verifica el estado de salud del servidor y la conexión a la base de datos.
 * Utilizado por load balancers y monitoreo para detectar fallos.
 *
 * Lógica de verificación:
 * - Ejecuta query SELECT NOW() en PostgreSQL
 * - Si responde correctamente: database = 'Conectado'
 * - Si falla: database = 'Desconectado'
 * - Retorna versión y arquitectura del sistema
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con estado del sistema
 *
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *       500:
 *         description: Error en el servidor
 */
// 🏥 ESTADO DEL SERVIDOR
const healthCheck = async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    const dbStatus = result.rows.length > 0;
    
    res.json({ 
      message: 'Servidor Backend TurnosAR funcionando correctamente',
      database: dbStatus ? 'Conectado' : 'Desconectado',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      architecture: 'Frontend ↔ Backend/Express ↔ PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error en el servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Obtiene estadísticas agregadas del sistema.
 * Retorna conteos de profesionales y pacientes registrados.
 *
 * Lógica de cálculo:
 * - Consulta COUNT(*) en tabla profesionales
 * - Consulta COUNT(*) en tabla pacientes
 * - Ejecuta ambas consultas en paralelo con Promise.all
 * - Retorna conteos como enteros
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con estadísticas del sistema
 *
 * @swagger
 * /stats:
 *   get:
 *     summary: Obtener estadísticas del sistema
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *       500:
 *         description: Error interno del servidor
 */
// 📊 ESTADÍSTICAS DEL SISTEMA
const getStats = async (req, res) => {
  try {
    const [profesionalesCount, pacientesCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM profesionales'),
      query('SELECT COUNT(*) as count FROM pacientes')
    ]);

    res.json({
      profesionales: parseInt(profesionalesCount.rows[0].count),
      pacientes: parseInt(pacientesCount.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  healthCheck,
  getStats
};
