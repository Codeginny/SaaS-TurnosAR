import React, { useState, useEffect } from 'react';
import { backendAPI } from '../api/axiosInstance';
import { Calendar, TrendingUp, AlertTriangle, Info } from 'lucide-react';

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
 * @typedef {Object} CapacityStats
 * @property {number} totalSlots - Total de slots en la matriz
 * @property {number} saturatedSlots - Slots al 100% de ocupación
 * @property {number} lowDemandSlots - Slots con menos del 30% de ocupación
 * @property {string} averageOccupancy - Promedio de ocupación
 * @property {number} capacidadMaximaPorHora - Capacidad máxima por hora
 */

/**
 * @typedef {Object} CapacityData
 * @property {string} profesional - Nombre del profesional
 * @property {Array<CapacitySlot>} matriz - Matriz de capacidad (7 días x 12 horas)
 * @property {CapacityStats} estadisticas - Estadísticas agregadas
 */

/**
 * Componente de matriz de calor para análisis de capacidad operativa.
 * Visualiza patrones de ocupación por día y hora basado en datos históricos (3 meses).
 *
 * Características:
 * - Matriz 7 días × 12 horas (8:00 - 19:00)
 * - Color codificado por porcentaje de ocupación
 * - Tooltips interactivos con sugerencias de acción
 * - KPIs: ocupación promedio, slots saturados, capacidad disponible
 * - Data Science: Identifica horarios pico y valles de demanda
 *
 * @returns {JSX.Element} Matriz de calor de capacidad operativa
 */
const CapacityHeatmap = () => {
  const [capacityData, setCapacityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchCapacityData();
  }, []);

  /**
   * Obtiene datos de capacidad del backend.
 * Consulta análisis de ocupación de los últimos 3 meses.
 *
 * @returns {Promise<void>} Actualiza estado con datos de capacidad
 */
  const fetchCapacityData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const response = await backendAPI.get('/stats/capacity');
        setCapacityData(response.data);
        setError('');
      } else {
        setLoading(false);
        setError('No estás autenticado');
      }
    } catch (err) {
      console.error('Error al obtener datos de capacidad:', err);
      setError('Error al cargar el análisis de capacidad');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determina la clase de color según porcentaje de ocupación.
 * Escala de 5 niveles: sin datos, baja, normal, alta, saturado.
 *
 * @param {number} percentage - Porcentaje de ocupación (0-100)
 * @returns {string} Clases Tailwind para color de fondo
 */
  const getColorIntensity = (percentage) => {
    if (percentage === 0) return 'bg-gray-100 dark:bg-slate-700';
    if (percentage < 30) return 'bg-blue-100 dark:bg-blue-900/30';
    if (percentage < 60) return 'bg-blue-300 dark:bg-blue-700/50';
    if (percentage < 90) return 'bg-blue-500 dark:bg-blue-600';
    return 'bg-blue-700 dark:bg-blue-800';
  };

  /**
   * Genera sugerencia de acción según nivel de ocupación.
 * Basado en lógica de optimización de agenda.
 *
 * @param {number} percentage - Porcentaje de ocupación (0-100)
 * @returns {string} Sugerencia de acción
 */
  const getSuggestion = (percentage) => {
    if (percentage === 0) return 'Sin demanda histórica';
    if (percentage < 30) return 'Baja demanda - Considera promociones';
    if (percentage < 60) return 'Demanda normal - Capacidad disponible';
    if (percentage < 90) return 'Alta demanda - Reserva para pacientes VIP';
    return 'Saturado - Considera sobreturno o ajustar precio';
  };

  /**
   * Retorna etiqueta descriptiva del nivel de ocupación.
 *
 * @param {number} percentage - Porcentaje de ocupación (0-100)
 * @returns {string} Etiqueta: Sin datos, Baja, Normal, Alta, Saturado
 */
  const getOccupancyLabel = (percentage) => {
    if (percentage === 0) return 'Sin datos';
    if (percentage < 30) return 'Baja';
    if (percentage < 60) return 'Normal';
    if (percentage < 90) return 'Alta';
    return 'Saturado';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!capacityData) {
    return null;
  }

  // Orden argentino: Lunes a Domingo
  const diasOrdenados = [
    { nombre: 'Lunes', index: 1 },
    { nombre: 'Martes', index: 2 },
    { nombre: 'Miércoles', index: 3 },
    { nombre: 'Jueves', index: 4 },
    { nombre: 'Viernes', index: 5 },
    { nombre: 'Sábado', index: 6 },
    { nombre: 'Domingo', index: 0 }
  ];
  const horas = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 a 19:00

  // Agrupar datos por día
  const matrizPorDia = {};
  diasOrdenados.forEach(({ nombre, index }) => {
    matrizPorDia[nombre] = capacityData.matriz.filter(slot => slot.dia === index);
  });

  // Estilo inline para la grilla de 13 columnas (1 label + 12 horas)
  const gridStyle = { display: 'grid', gridTemplateColumns: '80px repeat(12, 1fr)', gap: '4px' };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            📊 Matriz de Capacidad Operativa
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Análisis de ocupación histórica (últimos 3 meses)
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-700 dark:bg-blue-800 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Saturado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700/50 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Baja</span>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ocupación Promedio</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {capacityData.estadisticas.averageOccupancy}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Horarios Saturados</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {capacityData.estadisticas.saturatedSlots}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Capacidad Disponible</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {capacityData.estadisticas.totalSlots - capacityData.estadisticas.saturatedSlots}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Baja Demanda</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {capacityData.estadisticas.lowDemandSlots}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '700px' }}>
          {/* Header con horas */}
          <div style={gridStyle} className="mb-2">
            <div></div>
            {horas.map((hora) => (
              <div key={hora} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                {hora}:00
              </div>
            ))}
          </div>

          {/* Filas por día (Lunes a Domingo) */}
          {diasOrdenados.map(({ nombre }) => (
            <div key={nombre} style={gridStyle} className="mb-1">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                {nombre}
              </div>
              {(matrizPorDia[nombre] || []).map((slot) => (
                <div
                  key={`${nombre}-${slot.hora}`}
                  className={`relative rounded cursor-pointer transition-all hover:scale-110 hover:z-10 ${getColorIntensity(slot.porcentajeOcupacion)}`}
                  style={{ aspectRatio: '1', minHeight: '32px' }}
                  onMouseEnter={(e) => { setHoveredCell(slot); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {slot.cantidadTurnos}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip flotante */}
      {hoveredCell && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-slate-700 max-w-xs" style={{ position: 'fixed', left: tooltipPos.x + 16, top: tooltipPos.y - 60, zIndex: 9999, pointerEvents: 'none' }}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                {hoveredCell.diaNombre} {hoveredCell.horaFormato}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                hoveredCell.porcentajeOcupacion >= 90 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : hoveredCell.porcentajeOcupacion >= 60
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {getOccupancyLabel(hoveredCell.porcentajeOcupacion)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Ocupación: {hoveredCell.porcentajeOcupacion.toFixed(0)}%</p>
              <p>Turnos: {hoveredCell.cantidadTurnos} / {hoveredCell.capacidadMaxima}</p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 pt-2">
              <p className="font-medium text-gray-700 dark:text-gray-300">💡 {getSuggestion(hoveredCell.porcentajeOcupacion)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityHeatmap;
