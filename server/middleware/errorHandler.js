/**
 * Middleware global de manejo de errores para centralizar respuestas de error.
 * 
 * **Estrategia de manejo de errores:**
 * 1. Intercepta cualquier error lanzado en la aplicación
 * 2. Clasifica por tipo (Zod, PostgreSQL, JSON, genérico)
 * 3. Retorna respuesta HTTP apropiada con mensaje user-friendly
 * 4. En desarrollo, expone stack trace para debugging
 * 
 * **Tipos de errores manejados:**
 * - ZodError: Errores de validación de esquemas (400)
 * - PostgreSQL: Códigos de error SQL (400/409/500)
 * - SyntaxError: JSON malformado en body (400)
 * - Genérico: Cualquier otro error (500)
 * 
 * **Códigos PostgreSQL:**
 * - 23505: Violación de restricción unique (409)
 * - 23503: Violación de foreign key (400)
 * - 23502: Violación de not null (400)
 * - 22P02: Representación de texto inválida (400)
 * 
 * **Uso en Express:**
 * ```javascript
 * app.use(errorHandler); // Debe ser el último middleware
 * ```
 *
 * @param {Error} err - Error capturado
 * @param {ExpressRequest} req - Objeto de solicitud Express
 * @param {ExpressResponse} res - Objeto de respuesta Express
 * @param {NextFunction} next - Callback para siguiente middleware
 * @returns {void} Envía respuesta JSON con error
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado por middleware global:', err);

  // Errores de validación de Zod (sanitización de datos)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.errors
    });
  }

  // Errores de PostgreSQL (integridad de datos)
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'El registro ya existe'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Referencia inválida'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Campo obligatorio faltante'
        });
      case '22P02': // Invalid text representation
        return res.status(400).json({
          error: 'Formato de dato inválido'
        });
      default:
        return res.status(500).json({
          error: 'Error de base de datos',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
  }

  // Errores de JSON (body malformado)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido'
    });
  }

  // Error por defecto (fallback)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Middleware para manejar rutas no encontradas (404).
 * Debe colocarse después de todas las rutas definidas.
 * 
 * **Propósito:**
 * - Captura solicitudes a endpoints inexistentes
 * - Retorna respuesta estandarizada 404
 * - Evita que Express envíe respuesta HTML por defecto
 * 
 * **Uso:**
 * ```javascript
 * app.use(notFoundHandler); // Después de todas las rutas
 * ```
 *
 * @param {ExpressRequest} req - Objeto de solicitud Express
 * @param {ExpressResponse} res - Objeto de respuesta Express
 * @returns {void} Envía respuesta 404 JSON
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Wrapper para manejar errores en controladores async.
 * 
 * **Problema que resuelve:**
 * Express no captura errores lanzados en funciones async por defecto.
 * Sin este wrapper, errores async causan unhandled promise rejection.
 * 
 * **Cómo funciona:**
 * - Envuelve el controlador en una Promise
 * - Captura cualquier error con .catch(next)
 * - Pasa el error al middleware errorHandler
 * 
 * **Uso:**
 * ```javascript
 * router.get('/api/turnos', asyncHandler(async (req, res) => {
 *   const turnos = await getTurnos();
 *   res.json(turnos);
 * }));
 * ```
 * 
 * @param {Function} fn - Controlador async de Express
 * @returns {Function} Middleware que maneja errores async
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
