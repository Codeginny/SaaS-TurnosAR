const jwt = require('jsonwebtoken');

/**
 * Clave secreta para firmar/verificar tokens JWT.
 * Se obtiene de variable de entorno o usa fallback (solo desarrollo).
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * @typedef {Object} RequestUser
 * @property {number} id - ID del usuario autenticado
 * @property {string} role - Rol: 'professional' o 'patient'
 * @property {number} iat - Timestamp de emisión (issued at)
 * @property {number} exp - Timestamp de expiración
 */

/**
 * @typedef {Object} ExpressRequest
 * @property {Object} headers - Headers HTTP
 * @property {string} [headers.authorization] - Header Authorization con Bearer token
 * @property {RequestUser} [user] - Usuario inyectado tras autenticación
 * @property {Object} params - Parámetros de ruta
 * @property {Object} query - Parámetros de query string
 * @property {Object} body - Cuerpo de la solicitud
 */

/**
 * @typedef {Object} ExpressResponse
 * @property {Function} status - Establece código HTTP
 * @property {Function} json - Envía respuesta JSON
 */

/**
 * @typedef {Function} NextFunction
 * @description Callback para pasar al siguiente middleware
 */

/**
 * Middleware principal de autenticación JWT para proteger rutas privadas.
 * 
 * **Flujo de seguridad:**
 * 1. Extrae token del header 'Authorization' en formato 'Bearer <token>'
 * 2. Verifica firma y validez del token usando JWT_SECRET
 * 3. Inyecta payload decodificado (id, role, iat, exp) en req.user
 * 4. Permite acceso al siguiente middleware/controlador
 * 
 * **Inyección de identidad:**
 * - req.user.id: ID del usuario autenticado (disponible en controladores)
 * - req.user.role: Rol para autorización ('professional' | 'patient')
 * - req.user.iat/exp: Timestamps para verificación de expiración
 * 
 * **Códigos de error HTTP:**
 * - 401 Unauthorized: Token ausente o expirado
 * - 403 Forbidden: Token inválido o malformado (firma incorrecta)
 * 
 * **Uso típico:**
 * ```javascript
 * router.get('/api/turnos', authenticateToken, getTurnosHandler);
 * ```
 *
 * @param {ExpressRequest} req - Objeto de solicitud Express con header Authorization
 * @param {ExpressResponse} res - Objeto de respuesta Express
 * @param {NextFunction} next - Callback para pasar al siguiente middleware
 * @returns {void} Inyecta req.user o retorna error HTTP
 */
const authenticateToken = (req, res, next) => {
  // Paso 1: Extraer token del header Authorization
  // Formato esperado: 'Bearer eyJhbGciOiJIUzI1NiIs...'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extraer token después de 'Bearer'

  // Paso 2: Validar presencia del token
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. No se proporcionó token.' 
    });
  }

  try {
    // Paso 3: Verificar firma y decodificar payload
    // jwt.verify valida: firma, expiración, estructura del token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Paso 4: Inyectar identidad en el request
    // Los controladores pueden acceder a req.user.id y req.user.role
    req.user = decoded; // { id, role, iat, exp }
    
    // Paso 5: Permitir acceso al siguiente middleware/controlador
    next();
  } catch (error) {
    // Manejo específico de token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
      error: 'Token expirado. Por favor, inicie sesión nuevamente.' 
      });
    }
    // Manejo de token inválido (firma incorrecta, formato malformado)
    return res.status(403).json({ 
      error: 'Token inválido.' 
    });
  }
};

/**
 * Middleware para verificar que el usuario tiene un rol específico.
 * Alias de authorize para compatibilidad con código existente.
 *
 * Errores:
 * - 401: Usuario no autenticado (req.user no existe)
 * - 403: Rol no está en lista de roles permitidos
 *
 * @param {Array<string>} allowedRoles - Lista de roles permitidos
 * @returns {Function} Middleware de Express
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado. Permisos insuficientes.' 
      });
    }

    next();
  };
};

/**
 * Middleware de autorización flexible por roles.
 * Verifica que req.user.role esté en la lista de roles permitidos.
 * Requiere que authenticateToken se ejecute previamente.
 *
 * Errores:
 * - 401: Usuario no autenticado
 * - 403: Rol no autorizado
 *
 * @param {Array<string>} roles - Lista de roles permitidos (vacío = todos)
 * @returns {Function} Middleware de Express
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // req.user viene del middleware de autenticación JWT previo
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado.' 
      });
    }

    console.log('🔐 DEBUG AUTH - req.user:', req.user);
    console.log('🔐 DEBUG AUTH - roles permitidos:', roles);
    console.log('🔐 DEBUG AUTH - req.user.role:', req.user.role);
    console.log('🔐 DEBUG AUTH - role está en roles permitidos?:', roles.includes(req.user.role));

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado: No tienes los permisos necesarios.' 
      });
    }

    next();
  };
};

/**
 * Middleware para validar propiedad de recurso.
 * Verifica que el usuario autenticado es dueño del recurso solicitado.
 * Los profesionales tienen acceso completo a todos los recursos.
 *
 * @param {Function} getResourceOwnerId - Función que extrae ID del dueño del recurso
 * @param {ExpressRequest} getResourceOwnerId.req - Request Express
 * @returns {Function} Middleware de Express
 */
const requireOwnership = (getResourceOwnerId) => {
  return (req, res, next) => {
    const resourceOwnerId = getResourceOwnerId(req);
    const userId = req.user.id;

    if (req.user.role === 'professional') {
      // Los profesionales pueden ver todos los recursos (por ahora)
      return next();
    }

    if (parseInt(resourceOwnerId) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para acceder a este recurso.' 
      });
    }

    next();
  };
};

/**
 * Middleware de autenticación opcional.
 * Permite acceso sin token, pero inyecta usuario si token es válido.
 * Útil para endpoints públicos que pueden mostrar contenido personalizado.
 *
 * No retorna error nunca, simplemente agrega req.user si token es válido.
 *
 * @param {ExpressRequest} req - Objeto de solicitud Express
 * @param {ExpressResponse} res - Objeto de respuesta Express
 * @param {NextFunction} next - Callback para siguiente middleware
 * @returns {void}
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token inválido, pero continuamos sin usuario
      req.user = null;
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  authorize,
  requireOwnership,
  optionalAuth
};
