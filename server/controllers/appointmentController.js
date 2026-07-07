const { query } = require('../database/config');
const { createAppointmentSchema } = require('../validators/schemas');

/**
 * @typedef {Object} Turno
 * @property {number} id - ID del turno
 * @property {number} paciente_id - ID del paciente
 * @property {number} paciente_dni - DNI del paciente
 * @property {string} paciente_nombre - Nombre del paciente
 * @property {string} paciente_email - Email del paciente
 * @property {string} paciente_telefono - Teléfono del paciente
 * @property {string} provincia - Provincia de la clínica
 * @property {string} clinica - Nombre de la clínica
 * @property {string} especialidad - Especialidad médica
 * @property {string} profesional - Nombre del profesional
 * @property {string} fecha - Fecha del turno (YYYY-MM-DD)
 * @property {string} hora - Hora del turno (HH:mm)
 * @property {string} estado - Estado: pendiente, confirmado, cancelado, completado
 * @property {number} precio_consulta - Precio de la consulta
 * @property {string} created_at - Fecha de creación
 * @property {string} [fecha_cancelacion] - Fecha de cancelación (si aplica)
 * @property {boolean} facturado - Indica si está facturado
 * @property {string} [cae_number] - CAE de la factura
 * @property {string} [cae_vencimiento] - Vencimiento del CAE
 * @property {string} [tipo_comprobante] - Tipo de comprobante
 * @property {number} [monto_facturado] - Monto facturado
 */

/**
 * @typedef {Object} AppointmentRequest
 * @property {string} provincia - Provincia de la clínica
 * @property {string} clinica - Nombre de la clínica
 * @property {string} especialidad - Especialidad médica
 * @property {string} profesional - Nombre del profesional
 * @property {string} fecha - Fecha del turno (YYYY-MM-DD)
 * @property {string} hora - Hora del turno (HH:mm)
 * @property {number} pacienteId - ID del paciente
 * @property {string} [pacienteNombre] - Nombre del paciente (opcional)
 * @property {string} [pacienteEmail] - Email del paciente (opcional)
 * @property {string} [pacienteTelefono] - Teléfono del paciente (opcional)
 * @property {number} [precioConsulta] - Precio de la consulta (default: 5000)
 */

/**
 * Crea un nuevo turno médico en el sistema.
 * Valida datos, verifica autorización y persiste el turno con estado 'confirmado'.
 *
 * Lógica de autorización:
 * - Pacientes solo pueden crear turnos para sí mismos (pacienteId === userId)
 * - Profesionales pueden crear turnos para cualquier paciente
 *
 * Lógica de negocio:
 * - Estado inicial: 'confirmado'
 * - Precio default: $5,000 si no se especifica
 * - Datos del paciente se enriquecen desde tabla pacientes
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Usuario autenticado desde middleware
 * @param {number} req.user.id - ID del usuario autenticado
 * @param {string} req.user.role - Rol: 'patient' o 'professional'
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.provincia - Provincia de la clínica
 * @param {string} req.body.clinica - Nombre de la clínica
 * @param {string} req.body.especialidad - Especialidad médica
 * @param {string} req.body.profesional - Nombre del profesional
 * @param {string} req.body.fecha - Fecha del turno (YYYY-MM-DD)
 * @param {string} req.body.hora - Hora del turno (HH:mm)
 * @param {number} req.body.pacienteId - ID del paciente
 * @param {string} [req.body.pacienteNombre] - Nombre del paciente (opcional)
 * @param {string} [req.body.pacienteEmail] - Email del paciente (opcional)
 * @param {string} [req.body.pacienteTelefono] - Teléfono del paciente (opcional)
 * @param {number} [req.body.precioConsulta] - Precio de la consulta
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con turno creado
 *
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Crear turno médico
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentRequest'
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// 📅 CREAR TURNO MÉDICO
const createAppointment = async (req, res) => {
  try {
    const validationResult = createAppointmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { 
      provincia, 
      clinica, 
      especialidad, 
      profesional, 
      fecha, 
      hora, 
      pacienteId,
      pacienteNombre,
      pacienteEmail,
      pacienteTelefono,
      precioConsulta,
      tipoCobertura,
      nroAfiliado,
      estadoValidacion,
      montoSena,
      statusSena,
      mercadoPagoId
    } = validationResult.data;
    
    const userId = req.user.id; // ID del usuario autenticado desde JWT
    
    // Validación de propiedad: un paciente solo puede crear turnos para sí mismo
    if (req.user.role === 'patient' && parseInt(pacienteId) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para crear turnos para otro paciente.' 
      });
    }

    const pacienteResult = await query(
      'SELECT id, dni, nombre, email, telefono FROM pacientes WHERE id = $1',
      [parseInt(pacienteId)]
    );

    if (pacienteResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Paciente no encontrado' 
      });
    }

    const paciente = pacienteResult.rows[0];

    const result = await query(
      `INSERT INTO turnos (
        paciente_id, 
        paciente_dni, 
        paciente_nombre, 
        paciente_email, 
        paciente_telefono,
        provincia, 
        clinica, 
        especialidad, 
        profesional, 
        fecha, 
        hora, 
        estado,
        precio_consulta,
        tipo_cobertura,
        nro_afiliado,
        estado_validacion,
        monto_sena,
        status_sena,
        mercado_pago_id,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        parseInt(pacienteId),
        paciente.dni,
        paciente.nombre || pacienteNombre,
        paciente.email || pacienteEmail,
        paciente.telefono || pacienteTelefono,
        provincia,
        clinica,
        especialidad,
        profesional,
        fecha,
        hora,
        'confirmado',
        precioConsulta || 5000,
        tipoCobertura || 'particular',
        nroAfiliado || null,
        estadoValidacion || null,
        montoSena || null,
        statusSena || null,
        mercadoPagoId || null
      ]
    );

    const turno = result.rows[0];

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno
    });

  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtiene todos los turnos de un paciente específico.
 * Implementa control de acceso basado en roles.
 *
 * Lógica de autorización:
 * - Pacientes solo pueden ver sus propios turnos (id === userId)
 * - Profesionales pueden ver turnos de cualquier paciente
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Usuario autenticado desde middleware
 * @param {number} req.user.id - ID del usuario autenticado
 * @param {string} req.user.role - Rol: 'patient' o 'professional'
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del paciente a consultar
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con lista de turnos
 *
 * @swagger
 * /api/appointments/patient/{id}:
 *   get:
 *     summary: Obtener turnos de paciente
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de turnos
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// 📅 OBTENER TURNOS DE UN PACIENTE
const getAppointmentsByPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ID del usuario autenticado desde JWT
    
    // Validación de propiedad: un paciente solo puede ver sus propios turnos
    if (req.user.role === 'patient' && parseInt(id) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para ver los turnos de otro paciente.' 
      });
    }

    const result = await query(
      `SELECT * FROM turnos 
       WHERE paciente_id = $1 
       ORDER BY created_at DESC`,
      [parseInt(id)]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtiene todos los turnos del sistema (solo para profesionales).
 * Funcionalidad pendiente de implementación.
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con lista vacía (pendiente)
 *
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Obtener todos los turnos
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de turnos
 *       500:
 *         description: Error interno del servidor
 */
// 📅 OBTENER TODOS LOS TURNOS
const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const profResult = await query('SELECT nombre FROM profesionales WHERE id = $1', [parseInt(userId)]);
    const profesionalNombre = profResult.rows.length > 0 ? profResult.rows[0].nombre : null;

    let result;
    if (profesionalNombre) {
      result = await query('SELECT * FROM turnos WHERE profesional = $1 ORDER BY fecha DESC, hora DESC', [profesionalNombre]);
    } else {
      result = await query('SELECT * FROM turnos ORDER BY fecha DESC, hora DESC');
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Valida el token de obra social y procesa el reintegro de la seña.
 * Este endpoint es usado por el recepcionista en recepción.
 *
 * Lógica de negocio:
 * 1. Busca el turno y valida que sea obra social
 * 2. Simula validación con el agregador de obra social (Traditum/Mis Validaciones)
 * 3. Si válido, llama a Mercado Pago API para refund (simulado)
 * 4. Actualiza estado del turno: status_sena = 'reintegrada', estado_validacion = 'validado'
 * 5. Maneja casos de borde: falla en reintegro, tarjeta vencida, etc.
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del turno a validar
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {string} req.body.tokenVivo - Token de 6 dígitos de la app del paciente
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con resultado de validación
 *
 * @swagger
 * /api/appointments/{id}/validate-token:
 *   put:
 *     summary: Validar token de obra social y reintegrar seña
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenVivo:
 *                 type: string
 *                 description: Token de 6 dígitos
 *     responses:
 *       200:
 *         description: Validación exitosa y seña reintegrada
 *       400:
 *         description: Token inválido o error en reintegro
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// 🛡️ VALIDAR TOKEN DE OBRA SOCIAL Y REINTEGRAR SEÑA
const validateTokenAndRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { tokenVivo } = req.body;

    if (!tokenVivo || tokenVivo.length !== 6) {
      return res.status(400).json({ 
        error: 'Token inválido. Debe tener 6 dígitos.' 
      });
    }

    // 1. Buscar el turno
    const turnoResult = await query(
      'SELECT * FROM turnos WHERE id = $1',
      [parseInt(id)]
    );

    if (turnoResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Turno no encontrado' 
      });
    }

    const turno = turnoResult.rows[0];

    // Validar que sea obra social
    if (turno.tipo_cobertura !== 'obra_social') {
      return res.status(400).json({ 
        error: 'Este turno no corresponde a un paciente con obra social.' 
      });
    }

    // Validar que la seña esté cobrada
    if (turno.status_sena !== 'cobrada') {
      return res.status(400).json({ 
        error: 'La seña ya fue procesada anteriormente.' 
      });
    }

    // 2. Simular validación con agregador externo (Traditum/Mis Validaciones)
    // En producción, esto sería una llamada real a la API del agregador
    const validacionOK = await simularValidacionObraSocial({
      obraSocial: turno.obra_social_id,
      afiliado: turno.nro_afiliado,
      token: tokenVivo
    });

    if (!validacionOK) {
      await query(
        'UPDATE turnos SET estado_validacion = $1 WHERE id = $2',
        ['rechazado', parseInt(id)]
      );
      return res.status(400).json({ 
        error: 'Token inválido o afiliado moroso.' 
      });
    }

    // 3. Simular llamada a Mercado Pago API para refund
    // En producción, esto sería una llamada real a la API de Mercado Pago
    const refundResult = await simularRefundMercadoPago(turno.mercado_pago_id, turno.monto_sena);

    if (!refundResult.success) {
      // Caso de borde: falla en reintegro automático
      return res.status(400).json({ 
        error: 'Falla en reintegro automático. Realizar devolución manual o tomar como crédito.',
        warning: 'El token fue validado pero el reintegro falló. Contacte al paciente.',
        details: refundResult.error
      });
    }

    // 4. Actualizar estado en la base de datos
    await query(
      `UPDATE turnos 
       SET status_sena = $1, 
           estado_validacion = $2, 
           token_validacion = $3,
           estado = 'atendido'
       WHERE id = $4`,
      ['reintegrada', 'validado', tokenVivo, parseInt(id)]
    );

    res.json({ 
      message: 'Turno validado y seña reintegrada con éxito.',
      turno: {
        id: turno.id,
        montoReintegrado: turno.monto_sena,
        paymentId: turno.mercado_pago_id,
        tiempoEstimado: 'El reintegro se procesa al instante, pero puede demorar 2-10 días hábiles según el banco del paciente.'
      }
    });

  } catch (error) {
    console.error('Error al validar token y reintegrar:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

// 🔄 SIMULACIÓN: Validación con agregador de obra social
// En producción, esto sería una llamada real a la API (Traditum/Mis Validaciones)
const simularValidacionObraSocial = async ({ obraSocial, afiliado, token }) => {
  console.log('🔍 Simulando validación con agregador externo:', { obraSocial, afiliado, token });
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Para demo: aceptar tokens que empiezan con '1' o son '123456'
  return token.startsWith('1') || token === '123456';
};

// 💰 SIMULACIÓN: Refund con Mercado Pago
// En producción, esto sería una llamada real a la API de Mercado Pago
const simularRefundMercadoPago = async (paymentId, monto) => {
  console.log('💰 Simulando refund en Mercado Pago:', { paymentId, monto });
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Para demo: simular éxito 90% de las veces
  const random = Math.random();
  if (random > 0.1) {
    return { success: true, refundId: `REF_${Date.now()}` };
  } else {
    return { 
      success: false, 
      error: 'Tarjeta vencida o cuenta cerrada' 
    };
  }
};

module.exports = {
  createAppointment,
  getAppointmentsByPatient,
  getAllAppointments,
  validateTokenAndRefund
};
