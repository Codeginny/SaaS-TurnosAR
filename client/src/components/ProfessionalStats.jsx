import React, { useState, useEffect } from 'react';
import BarChart01 from './charts/BarChart01';
import DoughnutChart from './charts/DoughnutChart';
import LineChart01 from './charts/LineChart01';
import FacturaPreview from './FacturaPreview';
import { DollarSign, Calendar, TrendingUp, AlertTriangle, Users } from 'lucide-react';

/**
 * @typedef {Object} ProfessionalStatsProps
 * @property {Object} [stats] - Estadísticas del profesional (opcional, si no se pasa hace fetch local)
 * @property {boolean} [loading] - Estado de carga (opcional)
 * @property {string} [error] - Mensaje de error (opcional)
 * @property {string} [selectedPeriod] - Periodo seleccionado: hoy, semana, mes, año
 * @property {Function} [onPeriodChange] - Callback para cambiar periodo
 */

/**
 * @typedef {Object} StatsData
 * @property {string} profesional - Nombre del profesional
 * @property {string} periodo - Periodo de análisis
 * @property {Object} mesActual - Estadísticas del periodo actual
 * @property {number} mesActual.totalGanado - Ingresos totales
 * @property {number} mesActual.totalTurnos - Turnos completados
 * @property {number} mesActual.crecimientoPorcentaje - Porcentaje de crecimiento
 * @property {Object} hoy - Estadísticas de hoy
 * @property {number} hoy.totalTurnos - Turnos de hoy
 * @property {Object} turnosPorEstado - Conteo por estado
 * @property {number} turnosPorEstado.pendiente - Turnos pendientes
 * @property {number} turnosPorEstado.confirmado - Turnos confirmados
 * @property {number} turnosPorEstado.cancelado - Turnos cancelados
 * @property {number} turnosPorEstado.completado - Turnos completados
 * @property {Array<Object>} turnosPorDia - Turnos por día de la semana
 * @property {Array<Object>} pacientes - Lista de pacientes del periodo
 * @property {number} tasaAusentismo - Porcentaje de ausentismo
 * @property {number} costoConsulta - Costo por consulta
 * @property {Array<Object>} [ingresosMensuales] - Ingresos por mes (opcional)
 */

// Paleta de colores TurnosAR (azul)
const COLORS = {
  primary: '#2563eb',      // blue-600
  primaryLight: '#3b82f6', // blue-500
  primaryLighter: '#60a5fa', // blue-400
  success: '#10b981',      // emerald-500
  warning: '#f59e0b',      // amber-500
  danger: '#ef4444',       // red-500
  gray: '#6b7280'          // gray-500
};

const COLORS_PIE = [COLORS.primary, COLORS.success, COLORS.danger, COLORS.warning];

/**
 * Componente de estadísticas profesionales con visualización de datos BI.
 * Muestra KPIs financieros, gráficos de ocupación y gestión de facturación.
 *
 * Características:
 * - KPIs: Ingresos, turnos hoy, tasa de ausentismo
 * - Gráficos: Área (ingresos), Barras (turnos por día), Torta (estados)
 * - Drill-down: Modal de pacientes con facturación integrada
 * - Integración AFIP: Generación y vista de facturas
 *
 * @param {ProfessionalStatsProps} props - Props del componente
 * @returns {JSX.Element} Dashboard de estadísticas profesionales
 */
const ProfessionalStats = ({ stats, loading, error, selectedPeriod, onPeriodChange }) => {
  const [localStats, setLocalStats] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState('');
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  
  // Usar props si están disponibles, si no usar estado local
  const finalStats = stats || localStats;
  const finalLoading = loading !== undefined ? loading : localLoading;
  const finalError = error || localError;

  useEffect(() => {
    // Si no se pasan props, hacer fetch local (para compatibilidad)
    if (!stats && !loading && !error) {
      fetchStats();
    }
  }, [stats, loading, error, selectedPeriod]);

  /**
   * Obtiene estadísticas del backend si el componente funciona aislado.
   */
  const fetchStats = async () => {
    try {
      setLocalLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const response = await backendAPI.get('/stats/professional', {
          params: { periodo: selectedPeriod }
        });
        setLocalStats(response.data);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setLocalError('Error al cargar estadísticas');
    } finally {
      setLocalLoading(false);
    }
  };



  if (finalError) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <p className="text-red-500 dark:text-red-400">{finalError}</p>
      </div>
    );
  }

  if (!finalStats) {
    return null;
  }

  const hasData = (finalStats.mesActual?.totalTurnos > 0) || 
                  (finalStats.hoy?.totalTurnos > 0) || 
                  (finalStats.turnosPorEstado && Object.values(finalStats.turnosPorEstado).some(v => v > 0));

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no tienes datos para mostrar.</h3>
        <p className="text-gray-500 dark:text-gray-400">¡Empieza a agendar pacientes para ver tus estadísticas aquí!</p>
      </div>
    );
  }

  // Formateo de datos para Chart.js
  const ingresosChartData = {
    labels: finalStats.ingresosMensuales?.map(item => item.mes) || [],
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: finalStats.ingresosMensuales?.map(item => item.totalGanado) || [],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#3b82f6',
        pointHoverBackgroundColor: '#3b82f6',
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
      },
    ],
  };

  // Abreviar los nombres de los días para que entren sin rotar
  const abrevDias = { 'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié', 'Jueves': 'Jue', 'Viernes': 'Vie', 'Sábado': 'Sáb', 'Domingo': 'Dom' };

  const turnosSemanaChartData = {
    labels: finalStats.turnosPorDia?.map(item => abrevDias[item.dia] || item.dia) || [],
    datasets: [
      {
        label: 'Turnos',
        data: finalStats.turnosPorDia?.map(item => item.totalTurnos) || [],
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#2563eb',
        barPercentage: 0.66,
        categoryPercentage: 0.66,
      },
    ],
  };

  const mixFinanciacionData = {
    labels: finalStats.mixFinanciacion?.map(item => item.tipo) || [],
    datasets: [
      {
        label: 'Financiación',
        data: finalStats.mixFinanciacion?.map(item => item.cantidad) || [],
        backgroundColor: [
          '#3b82f6', // blue-500
          '#10b981', // emerald-500
          '#f59e0b', // amber-500
        ],
        hoverBackgroundColor: [
          '#2563eb', // blue-600
          '#059669', // emerald-600
          '#d97706', // amber-600
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-6 relative transition-opacity duration-300 ${finalLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {finalLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        📊 Tu Consultorio
      </h2>

      {/* KPIs - Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos del {selectedPeriod || 'Mes'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${finalStats.mesActual.totalGanado.toLocaleString('es-AR')}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {finalStats.mesActual.crecimientoPorcentaje >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 rotate-180" />
                )}
                <p className={`text-xs font-medium ${
                  finalStats.mesActual.crecimientoPorcentaje >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {finalStats.mesActual.crecimientoPorcentaje > 0 ? '+' : ''}{finalStats.mesActual.crecimientoPorcentaje.toFixed(1)}% vs periodo anterior
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {finalStats.mesActual.totalTurnos} turnos completados
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Turnos Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {finalStats.hoy.totalTurnos}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {finalStats.hoy.totalTurnos > 0 ? 'Revisa tu grilla hoy' : 'Sin turnos hoy'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-lg p-4 ${
          finalStats.tasaAusentismo > 20 
            ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' 
            : 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Ausentismo</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${
                  finalStats.tasaAusentismo > 20 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {finalStats.tasaAusentismo.toFixed(1)}%
                </p>
                {finalStats.tasaAusentismo > 20 && (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <p className={`text-xs ${
                finalStats.tasaAusentismo > 20 
                  ? 'text-red-600 dark:text-red-400 font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {finalStats.tasaAusentismo > 20 
                  ? '⚠️ Tasa de ausentismo alta' 
                  : 'Nivel aceptable'}
              </p>
            </div>
            <Users className={`w-8 h-8 ${
              finalStats.tasaAusentismo > 20 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-purple-600 dark:text-purple-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Gráfico de Áreas - Ingresos Mensuales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💰 Ingresos Mensuales (Año Actual)
        </h3>
        <div className="min-h-[256px] w-full">
          <LineChart01 data={ingresosChartData} width={595} height={256} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Turnos por Día */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📅 Turnos Totales
          </h3>
          <div className="min-h-[300px] w-full">
            <BarChart01 data={turnosSemanaChartData} width={595} height={256} />
          </div>
        </div>

        {/* Financiacion - Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💰 Distribución de Coberturas
          </h3>
          <div className="min-h-[300px] w-full">
            <DoughnutChart data={mixFinanciacionData} width={389} height={256} />
          </div>
        </div>
      </div>


      {/* Detalle de ingresos por tipo */}
      {finalStats.mixFinanciacion && finalStats.mixFinanciacion.length > 0 && (
        <div className="mt-16">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Detalle por Cobertura
            </h3>
            <div className="space-y-3">
              {finalStats.mixFinanciacion.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{item.tipo}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {item.cantidad} turnos
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ${item.ingresos.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(item.cantidad / finalStats.mixFinanciacion.reduce((s, m) => s + m.cantidad, 0)) * 100}%`,
                        backgroundColor: [COLORS.primary, COLORS.success, COLORS.warning][index % 3]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}

      {/* Ingresos Estimados - KPI Cards */}
      {finalStats.ingresosEstimados && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Ingresos Estimados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ingreso Directo</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ${finalStats.ingresosEstimados.ingresoDirecto.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Particulares - Cobro inmediato
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente Liquidacion</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    ${finalStats.ingresosEstimados.ingresoPendiente.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    Obras Sociales y Prepagas - Cobro 30/60 dias
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Promedio</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    ${finalStats.ingresosEstimados.ticketPromedio.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    Promedio por consulta
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Efectividad de Turnos - Pacientes Nuevos vs Recurrentes */}
      {finalStats.efectividadTurnos && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🩺 Efectividad de Turnos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pacientes Primera Vez */}
            <div className="bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-900/20 dark:to-sky-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Primera Vez</p>
                  <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">
                    {finalStats.efectividadTurnos.primeraVez}
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-1">
                    Pacientes nuevos (crecimiento)
                  </p>
                </div>
                <Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>

            {/* Pacientes Recurrentes */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Control / Seguimiento</p>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">
                    {finalStats.efectividadTurnos.seguimiento}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-500 mt-1">
                    Pacientes recurrentes (fidelizacion)
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
            </div>

            {/* Tasa de Fidelizacion */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Fidelizacion</p>
                  <p className={`text-3xl font-bold ${
                    finalStats.efectividadTurnos.tasaFidelizacion >= 40 
                      ? 'text-emerald-700 dark:text-emerald-400' 
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {finalStats.efectividadTurnos.tasaFidelizacion.toFixed(1)}%
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    {finalStats.efectividadTurnos.totalPacientesUnicos} pacientes unicos
                  </p>
                </div>
                <TrendingUp className={`w-8 h-8 ${
                  finalStats.efectividadTurnos.tasaFidelizacion >= 40 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              {/* Barra de progreso visual */}
              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3 mt-2">
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-500 transition-all duration-500"
                    style={{ 
                      width: `${finalStats.efectividadTurnos.totalPacientesUnicos > 0 
                        ? (finalStats.efectividadTurnos.primeraVez / finalStats.efectividadTurnos.totalPacientesUnicos) * 100 
                        : 0}%` 
                    }}
                    title={`Primera vez: ${finalStats.efectividadTurnos.primeraVez}`}
                  />
                  <div 
                    className="bg-violet-500 transition-all duration-500"
                    style={{ 
                      width: `${finalStats.efectividadTurnos.totalPacientesUnicos > 0 
                        ? (finalStats.efectividadTurnos.seguimiento / finalStats.efectividadTurnos.totalPacientesUnicos) * 100 
                        : 0}%` 
                    }}
                    title={`Seguimiento: ${finalStats.efectividadTurnos.seguimiento}`}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-cyan-600 dark:text-cyan-400">Nuevos</span>
                <span className="text-xs text-violet-600 dark:text-violet-400">Recurrentes</span>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Modal de Factura */}
      {showFacturaModal && facturaData && (
        <FacturaPreview
          comprobante={facturaData.comprobante}
          emisor={facturaData.emisor}
          receptor={facturaData.receptor}
          turno={facturaData.turno}
          onClose={() => setShowFacturaModal(false)}
        />
      )}
    </div>
  );
};

export default ProfessionalStats;
