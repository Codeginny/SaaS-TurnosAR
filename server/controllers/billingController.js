const { query } = require('../database/config');
const { calcularLiquidacion, generarComprobanteSimulado, generarQR, validarReceptor } = require('../services/billingService');

/**
 * @typedef {Object} Liquidacion
 * @property {string} tipo - Tipo de comprobante (FACTURA_C o NOTA_CREDITO_C)
 * @property {number} montoTotal - Monto total a facturar o devolver
 * @property {number} montoGravado - Monto gravado (0 para monotributo)
 * @property {number} montoIva - Monto de IVA (0 para monotributo)
 * @property {string} concepto - Descripción del concepto facturado
 * @property {string} observacion - Observaciones sobre la liquidación
 * @property {number} [montoADevolver] - Monto a devolver en notas de crédito
 */

/**
 * @typedef {Object} ComprobanteAFIP
 * @property {string} CAE - Código de Autorización Electrónico
 * @property {string} CAE_Vencimiento - Fecha de vencimiento del CAE
 * @property {number} PuntoVenta - Número de punto de venta
 * @property {number} ComprobanteNro - Número de comprobante
 */

/**
 * @typedef {Object} ComprobanteResponse
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {string} mensaje - Mensaje descriptivo del resultado
 * @property {Object} comprobante - Datos del comprobante generado
 * @property {string} comprobante.cae - CAE del comprobante
 * @property {string} comprobante.caeVencimiento - Vencimiento del CAE
 * @property {number} comprobante.puntoVenta - Punto de venta
 * @property {number} comprobante.numeroComprobante - Número de comprobante
 * @property {string} comprobante.tipo - Tipo de comprobante
 * @property {number} comprobante.montoTotal - Monto total
 * @property {number} comprobante.montoGravado - Monto gravado
 * @property {number} comprobante.montoIva - Monto de IVA
 * @property {string} comprobante.concepto - Concepto facturado
 * @property {string} comprobante.observacion - Observaciones
 * @property {string} comprobante.qrUrl - URL del QR de validación
 * @property {Object} emisor - Datos del emisor
 * @property {string} emisor.nombre - Nombre del profesional
 * @property {string} emisor.cuit - CUIT del emisor
 * @property {Object} receptor - Datos del receptor
 * @property {string} receptor.nombre - Nombre del paciente
 * @property {string} receptor.email - Email del paciente
 * @property {string} receptor.telefono - Teléfono del paciente
 * @property {Object} turno - Datos del turno
 * @property {number} turno.id - ID del turno
 * @property {string} turno.fecha - Fecha del turno
 * @property {string} turno.hora - Hora del turno
 * @property {string} turno.especialidad - Especialidad
 * @property {string} turno.clinica - Clínica
 */

/**
 * @typedef {Object} InvoiceData
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {Object} comprobante - Datos del comprobante
 * @property {string} comprobante.cae - CAE del comprobante
 * @property {string} comprobante.caeVencimiento - Vencimiento del CAE
 * @property {string} comprobante.tipoComprobante - Tipo de comprobante
 * @property {number} comprobante.monto - Monto facturado
 * @property {string} comprobante.facturaUrl - URL de la factura
 * @property {string} comprobante.fechaFacturacion - Fecha de facturación
 * @property {Object} turno - Datos del turno
 * @property {number} turno.id - ID del turno
 * @property {string} turno.pacienteNombre - Nombre del paciente
 * @property {string} turno.fecha - Fecha del turno
 * @property {string} turno.hora - Hora del turno
 * @property {string} turno.especialidad - Especialidad
 */

/**
 * Genera comprobante de facturación AFIP-Ready para un turno específico.
 * Implementa lógica de penalidades según reglas de negocio y garantiza idempotencia.
 *
 * Lógica de negocio:
 * - Turno completado: Factura C por $30,000 (monto completo)
 * - Turno cancelado < 48hs: Factura C por $30,000 (penalidad por inasistencia)
 * - Turno cancelado > 48hs: Nota de Crédito C por $27,000 (devolución 90%, retención 10%)
 * - Idempotencia: Si ya existe CAE, retorna comprobante existente (HTTP 409)
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Usuario autenticado desde middleware
 * @param {number} req.user.id - ID del usuario profesional
 * @param {Object} req.body - Cuerpo de la solicitud
 * @param {number} req.body.turnoId - ID del turno a facturar
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con comprobante generado
 *
 * @swagger
 * /api/billing/generate:
 *   post:
 *     summary: Generar comprobante de facturación
 *     tags: [Facturación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - turnoId
 *             properties:
 *               turnoId:
 *                 type: integer
 *                 description: ID del turno a facturar
 *     responses:
 *       200:
 *         description: Comprobante generado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo profesionales pueden facturar
 *       404:
 *         description: Turno no encontrado
 *       409:
 *         description: El turno ya tiene un comprobante
 *       500:
 *         description: Error interno del servidor
 */
const generateInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { turnoId } = req.body;

    if (!turnoId) {
      return res.status(400).json({ 
        error: 'Se requiere el ID del turno' 
      });
    }

    // Obtener datos del profesional
    const professionalResult = await query(
      'SELECT nombre, cuit FROM profesionales WHERE id = $1',
      [parseInt(userId)]
    );

    if (professionalResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Profesional no encontrado' 
      });
    }

    const profesional = professionalResult.rows[0];

    // Obtener datos del turno
    const turnoResult = await query(
      'SELECT * FROM turnos WHERE id = $1 AND profesional = $2',
      [parseInt(turnoId), profesional.nombre]
    );

    if (turnoResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Turno no encontrado' 
      });
    }

    const turno = turnoResult.rows[0];

    // Verificar idempotencia: si ya tiene CAE, no generar nuevamente
    if (turno.cae_number) {
      return res.status(409).json({ 
        error: 'El turno ya tiene un comprobante generado',
        comprobante: {
          cae: turno.cae_number,
          caeVencimiento: turno.cae_vencimiento,
          tipoComprobante: turno.tipo_comprobante,
          monto: turno.monto_facturado
        }
      });
    }

    // Solo se pueden facturar turnos completados o cancelados
    if (turno.estado !== 'completado' && turno.estado !== 'cancelado') {
      return res.status(400).json({ 
        error: 'Solo se pueden facturar turnos completados o cancelados' 
      });
    }

    const COSTO_CONSULTA = 30000;

    // Calcular liquidación según reglas de negocio
    const liquidacion = calcularLiquidacion(
      turno.fecha,
      turno.fecha_cancelacion || new Date(),
      turno.estado,
      COSTO_CONSULTA
    );

    // Generar comprobante simulado de AFIP
    const comprobanteAFIP = await generarComprobanteSimulado({
      cuitEmisor: profesional.cuit || '20123456789',
      puntoVenta: 1,
      tipoComprobante: liquidacion.tipo === 'NOTA_CREDITO_C' ? 8 : 11, // 8 = Nota de Crédito C, 11 = Factura C
      fecha: new Date().toISOString().split('T')[0],
      montoTotal: liquidacion.montoTotal || liquidacion.montoADevolver,
      montoGravado: liquidacion.montoGravado || 0,
      montoIva: liquidacion.montoIva || 0
    });

    // Generar QR
    const qrUrl = generarQR({
      cuit: profesional.cuit || '20123456789',
      puntoVenta: 1,
      tipoComprobante: liquidacion.tipo === 'NOTA_CREDITO_C' ? 8 : 11,
      numeroComprobante: comprobanteAFIP.ComprobanteNro,
      fecha: new Date().toISOString().split('T')[0],
      montoTotal: liquidacion.montoTotal || liquidacion.montoADevolver,
      montoGravado: liquidacion.montoGravado || 0,
      montoIva: liquidacion.montoIva || 0,
      cae: comprobanteAFIP.CAE,
      caeVencimiento: comprobanteAFIP.CAE_Vencimiento
    });

    // Actualizar turno con datos de facturación
    await query(
      `UPDATE turnos 
       SET cae_number = $1,
           cae_vencimiento = $2,
           factura_url = $3,
           tipo_comprobante = $4,
           monto_facturado = $5,
           fecha_facturacion = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        comprobanteAFIP.CAE,
        comprobanteAFIP.CAE_Vencimiento,
        qrUrl,
        liquidacion.tipo,
        liquidacion.montoTotal || liquidacion.montoADevolver,
        parseInt(turnoId)
      ]
    );

    res.json({
      success: true,
      mensaje: 'Comprobante generado exitosamente',
      comprobante: {
        cae: comprobanteAFIP.CAE,
        caeVencimiento: comprobanteAFIP.CAE_Vencimiento,
        puntoVenta: comprobanteAFIP.PuntoVenta,
        numeroComprobante: comprobanteAFIP.ComprobanteNro,
        tipo: liquidacion.tipo,
        montoTotal: liquidacion.montoTotal || liquidacion.montoADevolver,
        montoGravado: liquidacion.montoGravado || 0,
        montoIva: liquidacion.montoIva || 0,
        concepto: liquidacion.concepto,
        observacion: liquidacion.observacion,
        qrUrl
      },
      emisor: {
        nombre: profesional.nombre,
        cuit: profesional.cuit || '20123456789'
      },
      receptor: {
        nombre: turno.paciente_nombre,
        dni: turno.paciente_dni,
        email: turno.paciente_email,
        telefono: turno.paciente_telefono
      },
      turno: {
        id: turno.id,
        fecha: turno.fecha,
        hora: turno.hora,
        especialidad: turno.especialidad,
        clinica: turno.clinica
      }
    });

  } catch (error) {
    console.error('Error al generar comprobante:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Recupera un comprobante de facturación existente por ID de turno.
 * Retorna los datos del comprobante AFIP si el turno ya fue facturado.
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.turnoId - ID del turno a consultar
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con datos del comprobante
 *
 * @swagger
 * /api/billing/invoice/{turnoId}:
 *   get:
 *     summary: Obtener comprobante de un turno
 *     tags: [Facturación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comprobante encontrado
 *       404:
 *         description: Comprobante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
const getInvoice = async (req, res) => {
  try {
    const { turnoId } = req.params;

    const result = await query(
      'SELECT * FROM turnos WHERE id = $1 AND cae_number IS NOT NULL',
      [parseInt(turnoId)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Comprobante no encontrado' 
      });
    }

    const turno = result.rows[0];

    res.json({
      success: true,
      comprobante: {
        cae: turno.cae_number,
        caeVencimiento: turno.cae_vencimiento,
        tipoComprobante: turno.tipo_comprobante,
        monto: turno.monto_facturado,
        facturaUrl: turno.factura_url,
        fechaFacturacion: turno.fecha_facturacion
      },
      turno: {
        id: turno.id,
        pacienteNombre: turno.paciente_nombre,
        pacienteDni: turno.paciente_dni,
        fecha: turno.fecha,
        hora: turno.hora,
        especialidad: turno.especialidad
      }
    });

  } catch (error) {
    console.error('Error al obtener comprobante:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  generateInvoice,
  getInvoice
};
