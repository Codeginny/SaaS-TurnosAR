const { query } = require('../database/config');

/**
 * @typedef {Object} ProfessionalStats
 * @property {string} profesional - Nombre del profesional
 * @property {string} periodo - Periodo de análisis (hoy, semana, mes, año)
 * @property {Object} mesActual - Estadísticas del periodo actual
 * @property {number} mesActual.totalGanado - Ingresos totales del periodo
 * @property {number} mesActual.totalTurnos - Cantidad de turnos completados
 * @property {number} mesActual.crecimientoPorcentaje - Porcentaje de crecimiento vs periodo anterior
 * @property {Object} hoy - Estadísticas de hoy
 * @property {number} hoy.totalTurnos - Cantidad de turnos de hoy
 * @property {Object} turnosPorEstado - Conteo de turnos por estado
 * @property {number} turnosPorEstado.pendiente - Turnos pendientes
 * @property {number} turnosPorEstado.confirmado - Turnos confirmados
 * @property {number} turnosPorEstado.cancelado - Turnos cancelados
 * @property {number} turnosPorEstado.completado - Turnos completados
 * @property {Array<TurnoPorDia>} turnosPorDia - Turnos agrupados por día de la semana
 * @property {Array<PacienteTurno>} pacientes - Lista de pacientes del periodo
 * @property {number} tasaAusentismo - Porcentaje de ausentismo
 * @property {number} costoConsulta - Costo fijo por consulta
 */

/**
 * @typedef {Object} TurnoPorDia
 * @property {string} dia - Nombre del día en español
 * @property {number} diaNumero - Número del día (0-6, Domingo=0)
 * @property {number} totalTurnos - Cantidad de turnos ese día
 */

/**
 * @typedef {Object} PacienteTurno
 * @property {number} id - ID del turno
 * @property {string} nombre - Nombre del paciente
 * @property {string} email - Email del paciente
 * @property {string} telefono - Teléfono del paciente
 * @property {string} fecha - Fecha del turno (YYYY-MM-DD)
 * @property {string} hora - Hora del turno (HH:mm)
 * @property {string} clinica - Clínica del turno
 * @property {string} especialidad - Especialidad del turno
 * @property {string} estado - Estado del turno (pendiente, confirmado, cancelado, completado)
 * @property {boolean} facturado - Indica si está facturado
 * @property {string} [cae_number] - CAE de la factura si existe
 */

/**
 * @typedef {Object} CapacitySlot
 * @property {number} dia - Número del día (0-6)
 * @property {string} diaNombre - Nombre del día en español
 * @property {number} hora - Hora del día (8-19)
 * @property {string} horaFormato - Hora formateada (HH:00)
 * @property {number} cantidadTurnos - Cantidad de turnos en ese slot
 * @property {number} capacidadMaxima - Capacidad máxima por hora (2)
 * @property {number} porcentajeOcupacion - Porcentaje de ocupación (0-100)
 */

/**
 * @typedef {Object} CapacityAnalytics
 * @property {string} profesional - Nombre del profesional
 * @property {Array<CapacitySlot>} matriz - Matriz de capacidad (7 días x 12 horas)
 * @property {Object} estadisticas - Estadísticas agregadas
 * @property {number} estadisticas.totalSlots - Total de slots en la matriz
 * @property {number} estadisticas.saturatedSlots - Slots al 100% de ocupación
 * @property {number} estadisticas.lowDemandSlots - Slots con menos del 30% de ocupación
 * @property {string} estadisticas.averageOccupancy - Promedio de ocupación
 * @property {number} estadisticas.capacidadMaximaPorHora - Capacidad máxima por hora
 */

/**
 * Obtiene estadísticas detalladas del profesional para un periodo específico.
 * Calcula ingresos, crecimiento, tasa de ausentismo y distribución de turnos por día.
 *
 * Lógica de cálculo:
 * - Ingresos = turnos_completados × COSTO_CONSULTA (30,000)
 * - Crecimiento = ((ingresos_actuales - ingresos_anteriores) / ingresos_anteriores) × 100
 * - Tasa ausentismo = (turnos_cancelados / total_turnos) × 100
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Usuario autenticado desde middleware
 * @param {number} req.user.id - ID del usuario profesional
 * @param {Object} req.query - Query parameters de la solicitud
 * @param {string} [req.query.periodo='mes'] - Periodo de análisis: hoy, semana, mes, año
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con estadísticas del profesional
 *
 * @swagger
 * /api/stats/professional:
 *   get:
 *     summary: Obtener estadísticas del profesional
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del profesional
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo profesionales pueden acceder
 *       500:
 *         description: Error interno del servidor
 */
const getProfessionalStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const COSTO_CONSULTA = 30000; // Regla de negocio: costo fijo por consulta
    const periodo = req.query.periodo || 'mes'; // hoy, semana, mes, año
    
    // Obtener el nombre del profesional desde la tabla profesionales
    const professionalResult = await query(
      'SELECT nombre FROM profesionales WHERE id = $1',
      [parseInt(userId)]
    );
    
    if (professionalResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Profesional no encontrado' 
      });
    }
    
    const professionalName = professionalResult.rows[0].nombre;

    // Obtener la fecha máxima para usarla como "hoy"
    const maxFechaResult = await query(`
      SELECT MAX(fecha) as max_fecha FROM turnos WHERE profesional = $1
    `, [professionalName]);
    const refDate = maxFechaResult.rows[0].max_fecha 
      ? `'${new Date(maxFechaResult.rows[0].max_fecha).toISOString().split('T')[0]}'::date` 
      : 'CURRENT_DATE';

    // Definir filtros de tiempo según el periodo
    let fechaFilter = '';
    let fechaFilterAnterior = '';
    
    switch (periodo) {
      case 'hoy':
        fechaFilter = `fecha = ${refDate}`;
        fechaFilterAnterior = `fecha = ${refDate} - INTERVAL '1 day'`;
        break;
      case 'semana':
        fechaFilter = `fecha >= ${refDate} - INTERVAL '7 days'`;
        fechaFilterAnterior = `fecha >= ${refDate} - INTERVAL '14 days' AND fecha < ${refDate} - INTERVAL '7 days'`;
        break;
      case 'mes':
        fechaFilter = `EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM ${refDate}) AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM ${refDate})`;
        fechaFilterAnterior = `EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM ${refDate} - INTERVAL '1 month') AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM ${refDate} - INTERVAL '1 month')`;
        break;
      case 'año':
        fechaFilter = `EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM ${refDate})`;
        fechaFilterAnterior = `EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM ${refDate}) - 1`;
        break;
      default:
        fechaFilter = `EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM ${refDate}) AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM ${refDate})`;
        fechaFilterAnterior = `EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM ${refDate} - INTERVAL '1 month') AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM ${refDate} - INTERVAL '1 month')`;

    }

    // 1. Ingresos del periodo actual
    const ingresosResult = await query(`
      SELECT 
        COUNT(id) as total_turnos
      FROM turnos
      WHERE profesional = $1 
        AND LOWER(estado) = 'completado'
        AND ${fechaFilter}
    `, [professionalName]);

    // 2. Ingresos del periodo anterior (para comparación)
    const ingresosAnteriorResult = await query(`
      SELECT 
        COUNT(id) as total_turnos
      FROM turnos
      WHERE profesional = $1 
        AND LOWER(estado) = 'completado'
        AND ${fechaFilterAnterior}
    `, [professionalName]);

    // 3. Conteo de turnos por estado (periodo actual)
    const estadosResult = await query(`
      SELECT 
        estado,
        COUNT(id) as total
      FROM turnos
      WHERE profesional = $1
        AND ${fechaFilter}
      GROUP BY estado
    `, [professionalName]);

    // 4. Turnos por día de la semana (periodo actual)
    const diasResult = await query(`
      SELECT 
        EXTRACT(DOW FROM fecha) as dia_numero,
        COUNT(id) as total_turnos
      FROM turnos
      WHERE profesional = $1
        AND ${fechaFilter}
      GROUP BY dia_numero
      ORDER BY dia_numero
    `, [professionalName]);

    // Mapeo de días de la semana en español (orden: Lunes a Domingo)
    const ordenDias = [1, 2, 3, 4, 5, 6, 0]; // 1:Lunes ... 0:Domingo
    const nombresDias = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };
    
    // Inicializar molde de 7 días con ceros
    const turnosPorDiaMap = {};
    ordenDias.forEach(num => {
      turnosPorDiaMap[num] = {
        dia: nombresDias[num],
        diaNumero: num,
        totalTurnos: 0
      };
    });

    // Llenar con datos reales
    diasResult.rows.forEach(row => {
      const diaNum = parseInt(row.dia_numero);
      if (turnosPorDiaMap[diaNum]) {
        turnosPorDiaMap[diaNum].totalTurnos = parseInt(row.total_turnos) || 0;
      }
    });

    // Convertir de nuevo a array ordenado (Lunes a Domingo)
    const turnosPorDia = ordenDias.map(num => turnosPorDiaMap[num]);

    // 5. Turnos de hoy (siempre hoy)
    const hoyResult = await query(`
      SELECT 
        COUNT(id) as total_turnos
      FROM turnos
      WHERE profesional = $1
        AND fecha = ${refDate}
    `, [professionalName]);

    // 6. Lista de pacientes del periodo (para drill-down)
    const pacientesResult = await query(`
      SELECT 
        id,
        paciente_nombre,
        paciente_email,
        paciente_telefono,
        fecha,
        hora,
        estado,
        especialidad,
        clinica
      FROM turnos
      WHERE profesional = $1
        AND ${fechaFilter}
      ORDER BY fecha DESC, hora DESC
    `, [professionalName]);

    // 7. Financiación (tipo de cobertura)
    const mixResult = await query(`
      SELECT 
        tipo_cobertura,
        COUNT(id) as total
      FROM turnos
      WHERE profesional = $1
      GROUP BY tipo_cobertura
    `, [professionalName]);

    // Calcular datos
    const turnosCompletados = parseInt(ingresosResult.rows[0].total_turnos) || 0;
    const turnosCompletadosAnterior = parseInt(ingresosAnteriorResult.rows[0].total_turnos) || 0;
    const ingresosActuales = turnosCompletados * COSTO_CONSULTA;
    const ingresosAnteriores = turnosCompletadosAnterior * COSTO_CONSULTA;

    // Calcular porcentaje de crecimiento
    let crecimientoPorcentaje = 0;
    if (ingresosAnteriores > 0) {
      crecimientoPorcentaje = ((ingresosActuales - ingresosAnteriores) / ingresosAnteriores) * 100;
    } else if (ingresosActuales > 0) {
      crecimientoPorcentaje = 100; // Primer periodo con datos
    }

    // Calcular tasa de ausentismo
    const turnosPorEstado = {
      pendiente: 0,
      confirmado: 0,
      cancelado: 0,
      completado: 0
    };
    
    let totalTurnos = 0;
    estadosResult.rows.forEach(row => {
      const estadoLower = row.estado.toLowerCase();
      if (turnosPorEstado.hasOwnProperty(estadoLower)) {
        turnosPorEstado[estadoLower] = parseInt(row.total) || 0;
      } else {
        turnosPorEstado[estadoLower] = parseInt(row.total) || 0;
      }
      totalTurnos += parseInt(row.total) || 0;
    });

    const tasaAusentismo = totalTurnos > 0 ? (turnosPorEstado.cancelado / totalTurnos) * 100 : 0;

    const hoy = {
      totalTurnos: parseInt(hoyResult.rows[0].total_turnos) || 0
    };

    const pacientes = pacientesResult.rows.map(row => ({
      id: row.id,
      nombre: row.paciente_nombre,
      email: row.paciente_email,
      telefono: row.paciente_telefono,
      fecha: row.fecha,
      hora: row.hora,
      clinica: row.clinica,
      especialidad: row.especialidad,
      estado: row.estado,
      facturado: row.facturado || false,
      cae_number: row.cae_number
    }));

    // 7. Financiacion - Distribucion por tipo de cobertura
    const mixFinanciacionResult = await query(`
      SELECT 
        COALESCE(tipo_cobertura, 'particular') as tipo_cobertura,
        COUNT(*) as total,
        SUM(precio_consulta) as ingresos
      FROM turnos
      WHERE profesional = $1
        AND LOWER(estado) IN ('completado', 'atendido')
        AND ${fechaFilter}
      GROUP BY tipo_cobertura
    `, [professionalName]);

    const etiquetasCobertura = {
      'particular': 'Particular',
      'obra_social': 'Obra Social',
      'prepaga': 'Prepaga'
    };

    const mixFinanciacion = mixFinanciacionResult.rows.map(row => ({
      tipo: etiquetasCobertura[row.tipo_cobertura] || row.tipo_cobertura,
      cantidad: parseInt(row.total) || 0,
      ingresos: parseFloat(row.ingresos) || 0
    }));

    // 8. Ingresos Estimados - Directo vs Pendiente de Liquidacion
    const ingresoDirecto = mixFinanciacion
      .filter(m => m.tipo === 'Particular')
      .reduce((sum, m) => sum + m.ingresos, 0);

    const ingresoPendiente = mixFinanciacion
      .filter(m => m.tipo !== 'Particular')
      .reduce((sum, m) => sum + m.ingresos, 0);

    const ingresoTotal = ingresoDirecto + ingresoPendiente;
    const ticketPromedio = totalTurnos > 0 ? Math.round(ingresoTotal / totalTurnos) : 0;

    const ingresosEstimados = {
      ingresoDirecto,
      ingresoPendiente,
      ingresoTotal,
      ticketPromedio
    };

    // 9. Efectividad de Turnos - Pacientes nuevos vs recurrentes
    const efectividadResult = await query(`
      SELECT 
        t.paciente_id,
        MIN(first_visit.primera_fecha) as primera_visita
      FROM turnos t
      LEFT JOIN (
        SELECT paciente_id, MIN(fecha) as primera_fecha
        FROM turnos
        WHERE profesional = $1
        GROUP BY paciente_id
      ) first_visit ON t.paciente_id = first_visit.paciente_id
      WHERE t.profesional = $1
        AND ${fechaFilter}
      GROUP BY t.paciente_id, first_visit.primera_fecha
    `, [professionalName]);

    // Determinar el inicio del periodo para clasificar
    let fechaInicioPeriodo = new Date();
    switch (periodo) {
      case 'hoy':
        fechaInicioPeriodo.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        fechaInicioPeriodo.setDate(fechaInicioPeriodo.getDate() - 7);
        break;
      case 'mes':
        fechaInicioPeriodo.setDate(1);
        break;
      case 'año':
        fechaInicioPeriodo.setMonth(0, 1);
        break;
    }

    let primeraVez = 0;
    let seguimiento = 0;
    efectividadResult.rows.forEach(row => {
      const primeraVisita = new Date(row.primera_visita);
      if (primeraVisita >= fechaInicioPeriodo) {
        primeraVez++;
      } else {
        seguimiento++;
      }
    });

    const totalPacientesUnicos = primeraVez + seguimiento;
    const tasaFidelizacion = totalPacientesUnicos > 0 
      ? (seguimiento / totalPacientesUnicos) * 100 
      : 0;

    const efectividadTurnos = {
      primeraVez,
      seguimiento,
      totalPacientesUnicos,
      tasaFidelizacion
    };

    // 10. Ingresos Mensuales (Últimos 6 meses para el gráfico de área)
    const ingresosMensualesResult = await query(`
      SELECT 
        TO_CHAR(fecha, 'Mon') as mes,
        EXTRACT(YEAR FROM fecha) as anio,
        EXTRACT(MONTH FROM fecha) as mes_num,
        SUM(precio_consulta) as total_ganado
      FROM turnos
      WHERE profesional = $1
        AND LOWER(estado) IN ('completado', 'confirmado')
        AND fecha >= DATE_TRUNC('month', ${refDate}) - INTERVAL '5 months'
      GROUP BY TO_CHAR(fecha, 'Mon'), EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha)
      ORDER BY anio ASC, mes_num ASC
    `, [professionalName]);

    const mapMeses = { 'Jan': 'Ene', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Abr', 'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Ago', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dic' };
    const ingresosMensuales = ingresosMensualesResult.rows.map(row => ({
      mes: mapMeses[row.mes] || row.mes,
      totalGanado: parseFloat(row.total_ganado) || 0
    }));

    res.json({
      profesional: professionalName,
      periodo,
      mesActual: {
        totalGanado: ingresosActuales,
        totalTurnos: turnosCompletados,
        crecimientoPorcentaje
      },
      hoy,
      turnosPorEstado,
      turnosPorDia,
      pacientes,
      tasaAusentismo,
      costoConsulta: COSTO_CONSULTA,
      mixFinanciacion,
      ingresosEstimados,
      efectividadTurnos,
      ingresosMensuales
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del profesional:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Genera análisis de capacidad mediante matriz de calor (Heatmap).
 * Analiza los últimos 3 meses de turnos para detectar patrones de ocupación
 * por día de la semana y hora del día.
 *
 * Lógica de cálculo:
 * - Analiza turnos de los últimos 90 días (3 meses)
 * - Matriz: 7 días × 12 horas (8:00 a 19:00)
 * - Capacidad máxima: 2 turnos por hora
 * - Porcentaje ocupación = (turnos_real / 2) × 100
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Usuario autenticado desde middleware
 * @param {number} req.user.id - ID del usuario profesional
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con matriz de capacidad
 *
 * @swagger
 * /api/stats/capacity:
 *   get:
 *     summary: Obtener análisis de capacidad (Heatmap)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matriz de capacidad por día y hora
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo profesionales pueden acceder
 *       500:
 *         description: Error interno del servidor
 */
const getCapacityAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const MAX_CAPACITY_PER_HOUR = 2; // Máximo 2 turnos por hora
    
    // Obtener el nombre del profesional
    const professionalResult = await query(
      'SELECT nombre FROM profesionales WHERE id = $1',
      [parseInt(userId)]
    );
    
    if (professionalResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Profesional no encontrado' 
      });
    }
    
    const professionalName = professionalResult.rows[0].nombre;

    // Obtener la fecha máxima para la simulación
    const maxFechaResult = await query(`
      SELECT MAX(fecha) as max_fecha FROM turnos WHERE profesional = $1
    `, [professionalName]);
    const refDate = maxFechaResult.rows[0].max_fecha 
      ? `'${new Date(maxFechaResult.rows[0].max_fecha).toISOString().split('T')[0]}'::date` 
      : 'CURRENT_DATE';

    // Consulta SQL para agrupar turnos por día de la semana y hora (últimos 3 meses)
    const capacityResult = await query(`
      SELECT 
        EXTRACT(DOW FROM fecha) as dia_semana, 
        EXTRACT(HOUR FROM hora::time) as hora_inicio,
        COUNT(*) as cantidad_turnos
      FROM turnos
      WHERE profesional = $1 
        AND fecha >= ${refDate} - INTERVAL '3 months'
        AND LOWER(estado) != 'cancelado'
      GROUP BY dia_semana, hora_inicio
      ORDER BY dia_semana, hora_inicio
    `, [professionalName]);

    // Crear matriz de capacidad (7 días x 12 horas: 8:00 a 19:00)
    const capacityMatrix = [];
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horas = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 a 19:00

    // Inicializar matriz con ceros
    for (let dia = 0; dia < 7; dia++) {
      for (let hora of horas) {
        capacityMatrix.push({
          dia: dia,
          diaNombre: diasSemana[dia],
          hora: hora,
          horaFormato: `${hora}:00`,
          cantidadTurnos: 0,
          capacidadMaxima: MAX_CAPACITY_PER_HOUR,
          porcentajeOcupacion: 0
        });
      }
    }

    // Llenar matriz con datos reales
    capacityResult.rows.forEach(row => {
      const dia = parseInt(row.dia_semana);
      const hora = parseInt(row.hora_inicio);
      
      if (hora >= 8 && hora <= 19) {
        const index = dia * 12 + (hora - 8);
        if (capacityMatrix[index]) {
          capacityMatrix[index].cantidadTurnos = parseInt(row.cantidad_turnos);
          capacityMatrix[index].porcentajeOcupacion = (row.cantidad_turnos / MAX_CAPACITY_PER_HOUR) * 100;
        }
      }
    });

    // Calcular estadísticas generales
    const totalSlots = capacityMatrix.length;
    const saturatedSlots = capacityMatrix.filter(slot => slot.porcentajeOcupacion >= 100).length;
    const lowDemandSlots = capacityMatrix.filter(slot => slot.porcentajeOcupacion < 30).length;
    const averageOccupancy = capacityMatrix.reduce((sum, slot) => sum + slot.porcentajeOcupacion, 0) / totalSlots;

    res.json({
      profesional: professionalName,
      matriz: capacityMatrix,
      estadisticas: {
        totalSlots,
        saturatedSlots,
        lowDemandSlots,
        averageOccupancy: averageOccupancy.toFixed(1),
        capacidadMaximaPorHora: MAX_CAPACITY_PER_HOUR
      }
    });

  } catch (error) {
    console.error('Error al obtener análisis de capacidad:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

// =============================================
// RF-001: MOTOR DE EXPORTACIÓN A EXCEL (STREAMS)
// =============================================

const { pool } = require('../database/config');
const { exportStatsSchema } = require('../validators/schemas');

/**
 * Resuelve los parámetros de fecha validados por Zod en fechas SQL concretas.
 * Soporta selectores rápidos (month, quarter, year) y rangos personalizados.
 *
 * @param {Object} params - Parámetros validados por exportStatsSchema
 * @param {string} [params.range] - Selector rápido: 'month' | 'quarter' | 'year'
 * @param {string} [params.start] - Fecha inicio YYYY-MM-DD (rango personalizado)
 * @param {string} [params.end] - Fecha fin YYYY-MM-DD (rango personalizado)
 * @returns {{ startDate: string, endDate: string }} Par de fechas en formato YYYY-MM-DD
 */
const resolveExportDateRange = (params, refDateStr) => {
  if (params.start && params.end) {
    return { startDate: params.start, endDate: params.end };
  }

  const now = refDateStr ? new Date(refDateStr) : new Date();
  let startDate;

  switch (params.range) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const formatDate = (d) => d.toISOString().split('T')[0];
  return { startDate: formatDate(startDate), endDate: formatDate(now) };
};

/**
 * Enmascara un DNI para proteger la privacidad del paciente en reportes.
 * Ejemplo: "34567890" se convierte en "34***890"
 *
 * @param {string|null} dni - DNI original del paciente
 * @returns {string} DNI parcialmente enmascarado
 */
const maskDni = (dni) => {
  if (!dni) return '***';
  const dniStr = String(dni);
  if (dniStr.length < 4) return '***';
  return dniStr.substring(0, 2) + '***' + dniStr.substring(dniStr.length - 3);
};

/**
 * Exporta estadísticas del profesional a un archivo Excel binario (.xlsx)
 * con dos pestañas: Resumen Ejecutivo y Auditoría de Citas.
 *
 * Utiliza exceljs en modo streaming para mantener consumo de RAM plano
 * y pg-query-stream para canalizar filas desde PostgreSQL sin cargarlas
 * todas en memoria simultáneamente.
 *
 * Seguridad (Sec-01): Usa exclusivamente req.user.id del token JWT
 * decodificado para aislar datos multi-tenant (prevención IDOR).
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Usuario autenticado desde middleware JWT
 * @param {number} req.user.id - ID del profesional (fuente segura)
 * @param {Object} req.query - Query params con filtros de fecha
 * @param {Object} res - Objeto de respuesta Express (stream binario)
 * @returns {Promise<void>} Stream binario .xlsx directo a la respuesta HTTP
 *
 * @swagger
 * /api/stats/export:
 *   get:
 *     summary: Exportar estadísticas a Excel (.xlsx)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *         description: Selector rápido de periodo
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivo Excel binario (.xlsx)
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros de fecha inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo profesionales pueden exportar
 *       500:
 *         description: Error interno del servidor
 */
const exportStatsToExcel = async (req, res) => {
  let pgClient = null;

  try {
    // 1. Validar parámetros de entrada con Zod
    const validationResult = exportStatsSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Parámetros de exportación inválidos',
        details: validationResult.error.errors
      });
    }

    // 2. Resolver usuario (IDOR-safe: usa req.user.id del JWT)
    const userId = req.user.id;

    // 3. Obtener nombre del profesional de forma segura
    const professionalResult = await query(
      'SELECT nombre FROM profesionales WHERE id = $1',
      [parseInt(userId)]
    );

    if (professionalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const professionalName = professionalResult.rows[0].nombre;

    // Obtener la fecha máxima para la simulación
    const maxFechaResult = await query(`
      SELECT MAX(fecha) as max_fecha FROM turnos WHERE profesional = $1
    `, [professionalName]);
    const refDateStr = maxFechaResult.rows[0].max_fecha 
      ? new Date(maxFechaResult.rows[0].max_fecha).toISOString().split('T')[0]
      : null;

    const { startDate, endDate } = resolveExportDateRange(validationResult.data, refDateStr);

    // 4. Importar exceljs de forma dinámica (lazy load)
    const ExcelJS = require('exceljs');

    // 5. Configurar headers HTTP binarios antes de escribir
    const safeFileName = `reporte-rentabilidad-${startDate}-a-${endDate}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // 6. Crear workbook en modo streaming (escritura por filas, RAM plana)
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
      useSharedStrings: false
    });

    // =============================================
    // PESTAÑA 1: RESUMEN EJECUTIVO (datos agregados)
    // =============================================

    const sheetResumen = workbook.addWorksheet('Resumen Ejecutivo');

    // Encabezado del reporte
    sheetResumen.columns = [
      { header: 'Mes', key: 'mes', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Turnos Completados', key: 'completados', width: 20 },
      { header: 'Ausentismos', key: 'ausentismos', width: 16 },
      { header: 'Ingresos Particulares ($)', key: 'ingresos_particular', width: 25 },
      { header: 'Ingresos Obras Sociales ($)', key: 'ingresos_obra_social', width: 28 },
      { header: 'Ticket Promedio ($)', key: 'ticket_promedio', width: 20 }
    ];

    // Estilizar encabezados
    sheetResumen.getRow(1).font = { bold: true, size: 11 };
    sheetResumen.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' }
    };
    sheetResumen.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

    // Query agregada por mes y día para el Resumen Ejecutivo
    const resumenResult = await query(`
      SELECT
        TO_CHAR(fecha, 'YYYY-MM') AS mes,
        fecha,
        COUNT(CASE WHEN estado = 'completado' THEN 1 END) AS completados,
        COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) AS ausentismos,
        COALESCE(SUM(CASE WHEN estado = 'completado' AND COALESCE(tipo_cobertura, 'particular') = 'particular' THEN precio_consulta ELSE 0 END), 0) AS ingresos_particular,
        COALESCE(SUM(CASE WHEN estado = 'completado' AND COALESCE(tipo_cobertura, 'particular') != 'particular' THEN precio_consulta ELSE 0 END), 0) AS ingresos_obra_social,
        CASE
          WHEN COUNT(CASE WHEN estado = 'completado' THEN 1 END) > 0
          THEN ROUND(
            COALESCE(SUM(CASE WHEN estado = 'completado' THEN precio_consulta ELSE 0 END), 0)
            / COUNT(CASE WHEN estado = 'completado' THEN 1 END), 2
          )
          ELSE 0
        END AS ticket_promedio
      FROM turnos
      WHERE profesional = $1
        AND fecha >= $2::date
        AND fecha <= $3::date
      GROUP BY mes, fecha
      ORDER BY fecha ASC
    `, [professionalName, startDate, endDate]);

    // Escribir filas del resumen
    const mesesMap = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };

    for (const row of resumenResult.rows) {
      const mesNum = row.mes.split('-')[1];
      sheetResumen.addRow({
        mes: mesesMap[mesNum] || row.mes,
        fecha: new Date(row.fecha).toLocaleDateString('es-AR'),
        completados: parseInt(row.completados) || 0,
        ausentismos: parseInt(row.ausentismos) || 0,
        ingresos_particular: parseFloat(row.ingresos_particular) || 0,
        ingresos_obra_social: parseFloat(row.ingresos_obra_social) || 0,
        ticket_promedio: parseFloat(row.ticket_promedio) || 0
      }).commit();
    }

    await sheetResumen.commit();

    // =============================================
    // PESTAÑA 2: AUDITORÍA DE CITAS (streaming fila por fila)
    // =============================================

    const sheetAuditoria = workbook.addWorksheet('Auditoría de Citas');

    sheetAuditoria.columns = [
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Hora', key: 'hora', width: 10 },
      { header: 'DNI Paciente', key: 'dni', width: 14 },
      { header: 'Paciente', key: 'nombre', width: 25 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Tipo Financiación', key: 'tipo_cobertura', width: 18 },
      { header: 'Monto ($)', key: 'monto', width: 14 },
      { header: 'Facturado', key: 'facturado', width: 12 },
      { header: 'CAE', key: 'cae', width: 18 }
    ];

    // Estilizar encabezados
    sheetAuditoria.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    sheetAuditoria.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' }
    };

    // Adquirir cliente dedicado del pool para streaming
    pgClient = await pool.connect();

    // Construir stream de lectura con pg-query-stream
    const QueryStream = require('pg-query-stream');
    const queryStream = new QueryStream(
      `SELECT
        fecha,
        hora,
        paciente_dni,
        paciente_nombre,
        estado,
        COALESCE(tipo_cobertura, 'particular') AS tipo_cobertura,
        COALESCE(precio_consulta, 0) AS precio_consulta,
        cae_number,
        fecha_facturacion
      FROM turnos
      WHERE profesional = $1
        AND fecha >= $2::date
        AND fecha <= $3::date
      ORDER BY fecha ASC, hora ASC`,
      [professionalName, startDate, endDate],
      { batchSize: 100 }
    );

    const dbStream = pgClient.query(queryStream);

    // Etiquetas legibles para tipo de cobertura
    const etiquetasCobertura = {
      'particular': 'Particular',
      'obra_social': 'Obra Social',
      'prepaga': 'Prepaga'
    };

    // Pipeline: leer fila del stream → escribir en la hoja Excel
    await new Promise((resolve, reject) => {
      dbStream.on('data', (row) => {
        sheetAuditoria.addRow({
          fecha: new Date(row.fecha).toLocaleDateString('es-AR'),
          hora: row.hora,
          dni: maskDni(row.paciente_dni),
          nombre: row.paciente_nombre || 'Sin nombre',
          estado: row.estado.charAt(0).toUpperCase() + row.estado.slice(1),
          tipo_cobertura: etiquetasCobertura[row.tipo_cobertura] || row.tipo_cobertura,
          monto: parseFloat(row.precio_consulta) || 0,
          facturado: row.fecha_facturacion ? 'Sí' : 'No',
          cae: row.cae_number || '-'
        }).commit();
      });

      dbStream.on('end', resolve);
      dbStream.on('error', reject);
    });

    await sheetAuditoria.commit();

    // 7. Finalizar workbook (flush del stream al response HTTP)
    await workbook.commit();

  } catch (error) {
    console.error('❌ Error en exportación a Excel:', error);

    // Si los headers ya fueron enviados, no podemos enviar JSON de error
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error interno al generar el reporte de exportación'
      });
    } else {
      // Headers ya enviados: destruir la respuesta para señalizar al cliente
      res.destroy();
    }
  } finally {
    // Liberar el cliente dedicado al pool (prevenir connection leaks)
    if (pgClient) {
      pgClient.release();
    }
  }
};

// Limpiar recursos si el cliente cancela la descarga abruptamente
const exportStatsToExcelSafe = async (req, res) => {
  // Detectar desconexión del cliente para abortar el pipeline
  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
  });

  return exportStatsToExcel(req, res);
};

// =============================================
// RF-001: MOTOR DE EXPORTACIÓN A CSV
// =============================================

/**
 * Exporta estadísticas del profesional a un archivo CSV.
 * Utiliza la misma consulta y lógica de filtrado que la exportación a Excel,
 * pero formatea directamente los resultados en texto CSV y envía las cabeceras HTTP necesarias.
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const exportStatsCSV = async (req, res) => {
  try {
    const validationResult = exportStatsSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Parámetros de exportación inválidos',
        details: validationResult.error.errors
      });
    }

    const userId = req.user.id;

    const professionalResult = await query(
      'SELECT nombre FROM profesionales WHERE id = $1',
      [parseInt(userId)]
    );

    if (professionalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const professionalName = professionalResult.rows[0].nombre;

    // Obtener la fecha máxima para la simulación
    const maxFechaResult = await query(`
      SELECT MAX(fecha) as max_fecha FROM turnos WHERE profesional = $1
    `, [professionalName]);
    const refDateStr = maxFechaResult.rows[0].max_fecha 
      ? new Date(maxFechaResult.rows[0].max_fecha).toISOString().split('T')[0]
      : null;

    const { startDate, endDate } = resolveExportDateRange(validationResult.data, refDateStr);

    // Asegúrate de que esta sea la consulta exacta en tu statsController.js
    const queryString = `SELECT fecha, hora, paciente_dni, paciente_nombre, estado, 
        COALESCE(tipo_cobertura, 'particular') AS tipo_cobertura, 
        COALESCE(precio_consulta, 0) AS precio_consulta, 
        cae_number, 
        fecha_facturacion
      FROM turnos
      WHERE profesional = $1 AND fecha >= $2::date AND fecha <= $3::date
      ORDER BY fecha ASC, hora ASC`;
    console.log('Consulta SQL:', queryString);
    const dataResult = await query(queryString, [professionalName, startDate, endDate]);

    const safeFileName = `reporte-rentabilidad-${startDate}-a-${endDate}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const headers = ['Fecha', 'Hora', 'DNI Paciente', 'Paciente', 'Estado', 'Tipo Financiacion', 'Monto', 'Facturado', 'CAE'];
    let csvContent = headers.join(',') + '\n';

    const etiquetasCobertura = {
      'particular': 'Particular',
      'obra_social': 'Obra Social',
      'prepaga': 'Prepaga'
    };

    dataResult.rows.forEach(row => {
      const fecha = row.fecha ? new Date(row.fecha).toLocaleDateString('es-AR') : '-';
      const hora = row.hora || '';
      const dni = maskDni(row.paciente_dni);
      const nombre = (row.paciente_nombre || 'Sin nombre').replace(/,/g, '');
      const estado = (row.estado || '').charAt(0).toUpperCase() + (row.estado || '').slice(1);
      const cobertura = etiquetasCobertura[row.tipo_cobertura] || row.tipo_cobertura;
      const monto = parseFloat(row.precio_consulta) || 0;
      const facturado = row.fecha_facturacion ? 'Si' : 'No';
      const cae = row.cae_number || '-';

      csvContent += `${fecha},${hora},${dni},${nombre},${estado},${cobertura},${monto},${facturado},${cae}\n`;
    });

    res.send(csvContent);
  } catch (error) {
    console.error('--- DETALLE ERROR EXPORTACIÓN ---', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno al generar el reporte CSV' });
    } else {
      res.destroy();
    }
  }
};

module.exports = {
  getProfessionalStats,
  getCapacityAnalytics,
  exportStatsToExcel: exportStatsToExcelSafe,
  exportStatsCSV
};
