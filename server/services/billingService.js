/**
 * Billing Service - Simulación de integración con AFIP/ARCA
 * 
 * Este servicio simula la comunicación con el Web Service de Facturación Electrónica (WSFE)
 * de AFIP para generar comprobantes electrónicos.
 * 
 * Arquitectura desacoplada: Si mañana se integra con AFIP real, solo se modifica este archivo.
 */

/**
 * Calcula la liquidación según las reglas de negocio
 * @param {Date} fechaTurno - Fecha del turno
 * @param {Date} fechaCancelacion - Fecha de cancelación (si aplica)
 * @param {string} estado - Estado actual del turno
 * @param {number} montoBase - Monto base de la consulta ($30,000)
 * @returns {Object} - Detalles de la liquidación
 */
const calcularLiquidacion = (fechaTurno, fechaCancelacion, estado, montoBase) => {
  const ahora = new Date();
  const fechaTurnoDate = new Date(fechaTurno);
  
  // Calcular límite de 48 horas antes del turno
  const limite48hs = new Date(fechaTurnoDate);
  limite48hs.setHours(limite48hs.getHours() - 48);

  // Caso 1: Turno completado -> Factura C completa
  if (estado === 'completado') {
    return {
      tipo: 'FACTURA_C',
      montoTotal: montoBase,
      montoGravado: montoBase * 0.79, // 79% gravado (IVA 21%)
      montoIva: montoBase * 0.21,
      concepto: 'Consulta Médica Profesional',
      observacion: 'Servicio médico prestado según turno agendado'
    };
  }

  // Caso 2: Cancelación tardía (< 48hs) -> Factura C por inasistencia
  if (estado === 'cancelado' && fechaCancelacion) {
    const fechaCancelacionDate = new Date(fechaCancelacion);
    
    if (fechaCancelacionDate >= limite48hs) {
      return {
        tipo: 'FACTURA_C',
        montoTotal: montoBase,
        montoGravado: montoBase * 0.79,
        montoIva: montoBase * 0.21,
        concepto: 'Cargo por Inasistencia',
        observacion: 'Cancelación fuera del plazo de 48 horas. Se aplica tarifa completa.'
      };
    }
  }

  // Caso 3: Cancelación temprana (> 48hs) -> Nota de Crédito con devolución
  if (estado === 'cancelado' && fechaCancelacion) {
    const fechaCancelacionDate = new Date(fechaCancelacion);
    
    if (fechaCancelacionDate < limite48hs) {
      return {
        tipo: 'NOTA_CREDITO_C',
        montoADevolver: montoBase * 0.9,
        retencion: montoBase * 0.1,
        concepto: 'Devolución por Cancelación',
        observacion: 'Cancelación con más de 48hs de antelación. Se devuelve el 90% (retención 10% por gastos administrativos)'
      };
    }
  }

  // Caso por defecto
  return {
    tipo: 'FACTURA_C',
    montoTotal: montoBase,
    montoGravado: montoBase * 0.79,
    montoIva: montoBase * 0.21,
    concepto: 'Consulta Médica Profesional',
    observacion: 'Servicio médico'
  };
};

/**
 * Genera un comprobante simulado de AFIP
 * @param {Object} datos - Datos del comprobante
 * @returns {Promise<Object>} - Respuesta simulada de AFIP
 */
const generarComprobanteSimulado = async (datos) => {
  // Simulamos un delay de red para que parezca real
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generar CAE aleatorio (13 dígitos)
  const cae = Math.floor(Math.random() * 10000000000000).toString().padStart(14, '0');
  
  // Calcular fecha de vencimiento del CAE (10 días desde hoy)
  const caeVencimiento = new Date();
  caeVencimiento.setDate(caeVencimiento.getDate() + 10);
  
  // Generar número de comprobante
  const comprobanteNro = Math.floor(Math.random() * 1000000);

  return {
    CAE: cae,
    CAE_Vencimiento: caeVencimiento.toISOString().split('T')[0],
    PuntoVenta: 1,
    ComprobanteNro: comprobanteNro,
    FechaProcesamiento: new Date().toISOString(),
    Success: true,
    Mensaje: 'Comprobante generado exitosamente'
  };
};

/**
 * Genera código QR para el comprobante (simulado)
 * @param {Object} datos - Datos del comprobante
 * @returns {string} - URL del QR (simulado)
 */
const generarQR = (datos) => {
  // En producción, esto generaría un QR real con la librería qrcode
  // Por ahora, retornamos una URL simulada
  const qrData = JSON.stringify({
    cuit: datos.cuitEmisor,
    ptoVta: datos.puntoVenta,
    tipoCmp: datos.tipoComprobante,
    nroCmp: datos.numeroComprobante,
    fecha: datos.fecha,
    impTotal: datos.montoTotal,
    impTotConc: 0,
    impNeto: datos.montoGravado,
    impOpEx: 0,
    impTrib: 0,
    impIVA: datos.montoIva,
    monId: 'PES',
    monCotiz: 1,
    cae: datos.cae,
    caeVto: datos.caeVencimiento
  });
  
  return `https://www.afip.gob.ar/fe/qr/?p=${encodeURIComponent(qrData)}`;
};

/**
 * Valida datos del receptor (simulado)
 * @param {string} cuit - CUIT del receptor
 * @returns {Promise<Object>} - Datos validados del receptor
 */
const validarReceptor = async (cuit) => {
  // Simulamos validación con API de AFIP
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validación básica de formato de CUIT (11 dígitos)
  if (!/^\d{11}$/.test(cuit)) {
    return {
      valid: false,
      error: 'CUIT inválido. Debe tener 11 dígitos.'
    };
  }
  
  return {
    valid: true,
    razonSocial: 'Paciente Validado',
    condicionIva: 'Consumidor Final',
    direccion: 'Dirección Validada'
  };
};

module.exports = {
  calcularLiquidacion,
  generarComprobanteSimulado,
  generarQR,
  validarReceptor
};
