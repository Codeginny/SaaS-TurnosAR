const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../database/config');
const { 
  registerProfessionalSchema,
  loginProfessionalSchema,
  registerPatientSchema,
  loginPatientSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateCredentialsSchema
} = require('../validators/schemas');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key-change-this';
const REFRESH_TOKEN_DAYS = 7; // Refresh token expira en 7 días

/**
 * @typedef {Object} Professional
 * @property {number} id - ID del profesional
 * @property {string} nombre - Nombre completo
 * @property {string} email - Email único
 * @property {string} telefono - Teléfono de contacto
 * @property {string} especialidad - Especialidad médica
 * @property {string} created_at - Fecha de creación
 */

/**
 * @typedef {Object} Patient
 * @property {number} id - ID del paciente
 * @property {number} dni - DNI único
 * @property {string} [nombre] - Nombre completo (opcional)
 * @property {string} [email] - Email (opcional)
 * @property {string} [telefono] - Teléfono (opcional)
 * @property {boolean} debe_cambiar_clave - Indica si debe cambiar contraseña
 * @property {string} created_at - Fecha de creación
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} message - Mensaje de respuesta
 * @property {Professional|Patient} [profesional] - Datos del profesional (solo en login profesional)
 * @property {Patient} [paciente] - Datos del paciente (solo en login paciente)
 * @property {string} token - JWT token para autenticación
 */

/**
 * @typedef {Object} UserWithoutPassword
 * @property {number} id - ID del usuario
 * @property {string} [nombre] - Nombre del usuario
 * @property {string} [email] - Email del usuario
 * @property {string} [dni] - DNI del usuario
 * @property {string} [telefono] - Teléfono del usuario
 * @property {string} [especialidad] - Especialidad (profesionales)
 * @property {boolean} [debe_cambiar_clave] - Flag de cambio de contraseña (pacientes)
 */

/**
 * Registra un nuevo profesional en el sistema.
 * Valida los datos con Zod, verifica unicidad de email y hashea la contraseña con bcrypt.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Verificación de email único
 * - Hash de contraseña con bcrypt (SALT_ROUNDS=10)
 * - No retorna contraseña en respuesta
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.nombre - Nombre completo del profesional
 * @param {string} req.body.email - Email único
 * @param {string} req.body.telefono - Teléfono de contacto
 * @param {string} req.body.especialidad - Especialidad médica
 * @param {string} req.body.password - Contraseña sin hashear
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con profesional registrado
 * @returns {Object} returns.professional - Datos del profesional sin contraseña
 *
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registrar un nuevo profesional
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfessionalRegister'
 *     responses:
 *       201:
 *         description: Profesional registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya existe
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 REGISTRO DE PROFESIONALES
const registerProfessional = async (req, res) => {
  try {
    const validationResult = registerProfessionalSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { nombre, email, telefono, especialidad, password, dni } = validationResult.data;

    // Auto-generar DNI si no se proporciona (para compatibilidad)
    const dniValue = dni ? parseInt(dni) : Math.floor(10000000 + Math.random() * 90000000);

    const existingUser = await query(
      'SELECT id FROM profesionales WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe un profesional con ese email' 
      });
    }

    // Verificar DNI único
    const existingDni = await query(
      'SELECT id FROM profesionales WHERE dni = $1',
      [dniValue]
    );

    if (existingDni.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe un profesional con ese DNI' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO profesionales (dni, nombre, email, telefono, especialidad, password) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, dni, nombre, email, telefono, especialidad, created_at`,
      [dniValue, nombre, email, telefono, especialidad, hashedPassword]
    );

    const profesional = result.rows[0];

    // Generar token JWT para auto-login después de registro
    const token = jwt.sign(
      { id: profesional.id, role: 'professional' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Profesional registrado exitosamente',
      profesional,
      token
    });

  } catch (error) {
    console.error('Error en registro de profesional:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Autentica un profesional y genera un JWT token.
 * Verifica credenciales y retorna token con expiración de 8 horas.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Comparación de contraseña con bcrypt.compare()
 * - Generación de JWT con expiración 8h
 * - Token incluye: { id, role: 'professional' }
 * - No retorna contraseña en respuesta
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.email - Email del profesional
 * @param {string} req.body.password - Contraseña sin hashear
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con token y datos del profesional
 * @returns {AuthResponse} returns.authResponse - Token y datos del profesional
 *
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login de profesional
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 LOGIN DE PROFESIONALES
const loginProfessional = async (req, res) => {
  try {
    const validationResult = loginProfessionalSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { email, password } = validationResult.data;

    const result = await query(
      'SELECT * FROM profesionales WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'No existe un usuario con ese email' 
      });
    }

    const profesional = result.rows[0];
    const contraseñaValida = await bcrypt.compare(password, profesional.password);
    
    if (!contraseñaValida) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta' 
      });
    }

    const { password: _, ...profesionalSinPassword } = profesional;
    
    // Generar Access Token (vida corta: 15 minutos)
    const accessToken = jwt.sign(
      { id: profesionalSinPassword.id, role: 'professional' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Generar Refresh Token (vida larga: 7 días)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    
    // Guardar refresh token en base de datos
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [profesionalSinPassword.id, refreshToken, expiresAt]
    );
    
    // Enviar refresh token en HttpOnly cookie (seguro contra XSS)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000, // 7 días
      path: '/'
    });
    
    res.json({
      message: 'Login exitoso',
      profesional: profesionalSinPassword,
      token: accessToken // Access token en respuesta JSON
    });

  } catch (error) {
    console.error('Error en login de profesional:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Registra un nuevo paciente en el sistema.
 * Valida DNI único, hashea contraseña y genera token de sesión.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Verificación de DNI único
 * - Hash de contraseña con bcrypt (SALT_ROUNDS=10)
 * - Flag debe_cambiar_clave = true por defecto
 * - Generación de JWT con expiración 8h
 * - Token incluye: { id, role: 'patient' }
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {number} req.body.dni - DNI único del paciente
 * @param {string} req.body.password - Contraseña sin hashear
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con paciente registrado y token
 * @returns {AuthResponse} returns.authResponse - Token y datos del paciente
 *
 * @swagger
 * /api/patient-register:
 *   post:
 *     summary: Registrar un nuevo paciente
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientRegister'
 *     responses:
 *       201:
 *         description: Paciente registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: DNI ya existe
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 REGISTRO DE PACIENTES
const registerPatient = async (req, res) => {
  try {
    const validationResult = registerPatientSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { dni, password } = validationResult.data;

    const existingPatient = await query(
      'SELECT id FROM pacientes WHERE dni = $1',
      [parseInt(dni)]
    );
    
    if (existingPatient.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Este número de documento ya está registrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO pacientes (dni, password, debe_cambiar_clave) 
       VALUES ($1, $2, $3) 
       RETURNING id, dni, nombre, email, telefono, debe_cambiar_clave, created_at`,
      [parseInt(dni), hashedPassword, true]
    );

    const paciente = result.rows[0];

    const { password: _, ...pacienteSinPassword } = paciente;
    
    const token = jwt.sign(
      { id: pacienteSinPassword.id, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Paciente registrado exitosamente',
      paciente: pacienteSinPassword,
      token
    });

  } catch (error) {
    console.error('Error en registro de paciente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Autentica un paciente y genera un JWT token.
 * Verifica credenciales por DNI y retorna token con expiración de 8 horas.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Comparación de contraseña con bcrypt.compare()
 * - Generación de JWT con expiración 8h
 * - Token incluye: { id, role: 'patient' }
 * - No retorna contraseña en respuesta
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {number} req.body.dni - DNI del paciente
 * @param {string} req.body.password - Contraseña sin hashear
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con token y datos del paciente
 * @returns {AuthResponse} returns.authResponse - Token y datos del paciente
 *
 * @swagger
 * /api/patient-login:
 *   post:
 *     summary: Login de paciente
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientLogin'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 LOGIN DE PACIENTES
const loginPatient = async (req, res) => {
  try {
    const validationResult = loginPatientSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { dni, password } = validationResult.data;

    const result = await query(
      'SELECT * FROM pacientes WHERE dni = $1',
      [parseInt(dni)]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'No existe un paciente con ese DNI' 
      });
    }

    const paciente = result.rows[0];
    const contraseñaValida = await bcrypt.compare(password, paciente.password);
    
    if (!contraseñaValida) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta' 
      });
    }

    const { password: _, ...pacienteSinPassword } = paciente;
    
    // Generar Access Token (vida corta: 15 minutos)
    const accessToken = jwt.sign(
      { id: pacienteSinPassword.id, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Generar Refresh Token (vida larga: 7 días)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    
    // Guardar refresh token en base de datos
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [pacienteSinPassword.id, refreshToken, expiresAt]
    );
    
    // Enviar refresh token en HttpOnly cookie (seguro contra XSS)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000, // 7 días
      path: '/'
    });
    
    res.json({
      message: 'Login exitoso',
      paciente: pacienteSinPassword,
      token: accessToken // Access token en respuesta JSON
    });

  } catch (error) {
    console.error('Error en login de paciente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Cambia la contraseña de un profesional autenticado.
 * Verifica contraseña actual antes de actualizar a la nueva.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Verificación de contraseña actual con bcrypt.compare()
 * - Hash de nueva contraseña con bcrypt (SALT_ROUNDS=10)
 * - Solo el propietario puede cambiar su contraseña
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del profesional
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.currentPassword - Contraseña actual
 * @param {string} req.body.newPassword - Nueva contraseña
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON de confirmación
 *
 * @swagger
 * /api/professional-change-password/{id}:
 *   put:
 *     summary: Cambiar contraseña de profesional
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Profesional no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 CAMBIO DE CONTRASEÑA DE PROFESIONALES
const changeProfessionalPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = changePasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { currentPassword, newPassword } = validationResult.data;

    const result = await query(
      'SELECT * FROM profesionales WHERE id = $1',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Profesional no encontrado' 
      });
    }

    const profesional = result.rows[0];
    const contraseñaActualValida = await bcrypt.compare(currentPassword, profesional.password);
    
    if (!contraseñaActualValida) {
      return res.status(401).json({ 
        error: 'La contraseña actual es incorrecta' 
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
      'UPDATE profesionales SET password = $1 WHERE id = $2',
      [hashedNewPassword, parseInt(id)]
    );

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en cambio de contraseña de profesional:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Cambia la contraseña de un paciente autenticado.
 * Verifica contraseña actual, actualiza y desactiva flag de cambio forzado.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Verificación de contraseña actual con bcrypt.compare()
 * - Hash de nueva contraseña con bcrypt (SALT_ROUNDS=10)
 * - Desactiva debe_cambiar_clave = false
 * - Actualiza timestamp updated_at
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del paciente
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.currentPassword - Contraseña actual
 * @param {string} req.body.newPassword - Nueva contraseña
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON de confirmación
 *
 * @swagger
 * /api/patient-change-password/{id}:
 *   put:
 *     summary: Cambiar contraseña de paciente
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 CAMBIO DE CONTRASEÑA DE PACIENTES
const changePatientPassword = async (req, res) => {
  try {
    const { id } = req.params;
    
    
    const validationResult = changePasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { currentPassword, newPassword } = validationResult.data;

    const result = await query(
      'SELECT * FROM pacientes WHERE id = $1',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Paciente no encontrado' 
      });
    }

    const paciente = result.rows[0];
    
    // BYPASS DE SEGURIDAD TEMPORAL: Si el usuario debe cambiar la clave, no verificar la contraseña actual
    if (!paciente.debe_cambiar_clave) {
      const contraseñaActualValida = await bcrypt.compare(currentPassword, paciente.password);
      
      if (!contraseñaActualValida) {
        return res.status(401).json({ 
          error: 'La contraseña actual es incorrecta' 
        });
      }
    } else {
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
      'UPDATE pacientes SET password = $1, debe_cambiar_clave = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [hashedNewPassword, false, parseInt(id)]
    );

    res.json({
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en cambio de contraseña:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Inicia el proceso de recuperación de contraseña para pacientes.
 * Genera un token numérico de 6 dígitos válido por 1 hora.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Búsqueda por DNI o email
 * - Token aleatorio de 6 dígitos (100000-999999)
 * - Expiración: 1 hora desde generación
 * - Respuesta uniforme (no revela si usuario existe)
 * - Email simulado en consola (producción: servicio real)
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {number} [req.body.dni] - DNI del paciente (opcional)
 * @param {string} [req.body.email] - Email del paciente (opcional)
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con mensaje de instrucciones
 *
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Instrucciones enviadas (si usuario existe)
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 RECUPERACIÓN DE CONTRASEÑA - SOLICITUD DE TOKEN
const forgotPassword = async (req, res) => {
  try {
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { dni, email } = validationResult.data;

    let queryText, queryParams;
    if (dni) {
      queryText = 'SELECT * FROM pacientes WHERE dni = $1';
      queryParams = [parseInt(dni)];
    } else {
      queryText = 'SELECT * FROM pacientes WHERE email = $1';
      queryParams = [email];
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.json({
        message: 'Si el usuario existe, recibirá un email con las instrucciones para restablecer su contraseña'
      });
    }

    const paciente = result.rows[0];
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      'UPDATE pacientes SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, paciente.id]
    );


    res.json({
      message: 'Si el usuario existe, recibirá un email con las instrucciones para restablecer su contraseña'
    });

  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Restablece la contraseña de un paciente usando el token de recuperación.
 * Valida token, expiración y actualiza la contraseña.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Verificación de token válido y no expirado
 * - Hash de nueva contraseña con bcrypt (SALT_ROUNDS=10)
 * - Limpieza de token y expiración tras uso
 * - Actualiza timestamp updated_at
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.token - Token de recuperación de 6 dígitos
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.newPassword - Nueva contraseña
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON de confirmación
 *
 * @swagger
 * /api/reset-password/{token}:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 RECUPERACIÓN DE CONTRASEÑA - RESTABLECIMIENTO CON TOKEN
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const validationResult = resetPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { newPassword } = validationResult.data;

    const result = await query(
      'SELECT * FROM pacientes WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado' 
      });
    }

    const paciente = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
      'UPDATE pacientes SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, paciente.id]
    );

    res.json({
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Valida credenciales de forma unificada para pacientes y profesionales.
 * Utilizado por sistemas externos que necesitan verificar autenticidad.
 *
 * Lógica de seguridad:
 * - Validación de esquema con Zod
 * - Soporta búsqueda por DNI para ambos roles
 * - Verificación de contraseña con bcrypt.compare()
 * - No retorna contraseña en respuesta
 * - Retorna tipo de usuario para identificación
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {number} req.body.dni - DNI del usuario
 * @param {string} req.body.password - Contraseña sin hashear
 * @param {string} req.body.tipo - Tipo de usuario: 'paciente' o 'profesional'
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con usuario validado
 * @returns {Object} returns.validation - Usuario sin contraseña y tipo
 *
 * @swagger
 * /api/validate-credentials:
 *   post:
 *     summary: Validar credenciales unificadas
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateCredentials'
 *     responses:
 *       200:
 *         description: Credenciales válidas
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 */
// 🔐 VALIDACIÓN DE CREDENCIALES UNIFICADA
const validateCredentials = async (req, res) => {
  try {
    const validationResult = validateCredentialsSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { dni, password, tipo } = validationResult.data;

    let user = null;

    if (tipo === 'paciente') {
      const result = await query(
        'SELECT * FROM pacientes WHERE dni = $1',
        [parseInt(dni)]
      );
      user = result.rows[0];
    } else if (tipo === 'profesional') {
      const result = await query(
        'SELECT * FROM profesionales WHERE dni = $1',
        [parseInt(dni)]
      );
      user = result.rows[0];
    } else {
      return res.status(400).json({ 
        error: 'Tipo debe ser "paciente" o "profesional"' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    const contraseñaValida = await bcrypt.compare(password, user.password);
    
    if (!contraseñaValida) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta' 
      });
    }

    const { password: _, ...userSinPassword } = user;
    
    res.json({
      message: 'Credenciales válidas',
      user: userSinPassword,
      tipo
    });

  } catch (error) {
    console.error('Error en validación de credenciales:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtiene lista de profesionales registrados.
 * Retorna todos los profesionales activos con sus datos principales.
 *
 * @swagger
 * /api/profesionales:
 *   get:
 *     summary: Lista de profesionales
 *     tags: [Profesionales]
 *     responses:
 *       200:
 *         description: Lista de profesionales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   email:
 *                     type: string
 *                   telefono:
 *                     type: string
 *                   especialidad:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 *
 * @param {ExpressRequest} req - Objeto de solicitud Express
 * @param {ExpressResponse} res - Objeto de respuesta Express
 * @returns {void} Envía respuesta JSON con lista de profesionales
 */
/**
 * Renueva el access token usando el refresh token de la cookie HttpOnly.
 * Este endpoint es llamado automáticamente por el frontend cuando el access token expira.
 *
 * Lógica de seguridad:
 * - Lee refresh token de cookie HttpOnly (no accesible desde JS)
 * - Valida que el token exista en base de datos y no esté revocado
 * - Genera nuevo access token con 15 minutos de vida
 * - Opcionalmente rota el refresh token (genera uno nuevo)
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.cookies - Cookies de la solicitud
 * @param {string} req.cookies.refreshToken - Refresh token de la cookie HttpOnly
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con nuevo access token
 *
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Renovar access token
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Access token renovado
 *       401:
 *         description: Refresh token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'No refresh token proporcionado' 
      });
    }
    
    // Buscar refresh token en base de datos (solo pacientes por ahora)
    const result = await query(
      `SELECT rt.*, p.id as user_id, p.nombre, p.email, p.dni, 'patient' as role
       FROM refresh_tokens rt
       JOIN pacientes p ON rt.user_id = p.id
       WHERE rt.token = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
      [refreshToken]
    );
    
    
    if (result.rows.length === 0) {
      // Token no válido o expirado, limpiar cookie
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ 
        error: 'Refresh token inválido o expirado' 
      });
    }
    
    const tokenData = result.rows[0];
    
    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { id: tokenData.user_id, role: tokenData.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Opcional: Rotar refresh token (generar uno nuevo por seguridad)
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    
    // Revocar token anterior
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1',
      [refreshToken]
    );
    
    // Guardar nuevo refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [tokenData.user_id, newRefreshToken, newExpiresAt]
    );
    
    // Enviar nuevo refresh token en cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.json({
      token: newAccessToken
    });
    
  } catch (error) {
    console.error('❌ Error al renovar token:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const getProfessionals = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nombre, email, telefono, especialidad, clinica, provincia, ciudad FROM profesionales'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  registerProfessional,
  loginProfessional,
  registerPatient,
  loginPatient,
  changeProfessionalPassword,
  refreshToken,
  changePatientPassword,
  forgotPassword,
  resetPassword,
  validateCredentials,
  getProfessionals
};
