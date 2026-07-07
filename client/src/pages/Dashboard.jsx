import React, { useState, useEffect, useContext } from 'react';
import { Calendar, User, Stethoscope, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X, Pause, DollarSign, BarChart3, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { AppointmentContext } from '../context/AppointmentContext';
import ProfessionalStats from '../components/ProfessionalStats';
import CapacityHeatmap from '../components/CapacityHeatmap';
import { backendAPI } from '../api/axiosInstance';
import FacturaPreview from '../components/FacturaPreview';
import { toast } from 'react-toastify';

/**
 * @typedef {Object} DashboardStats
 * @property {number} total - Total de turnos
 * @property {number} today - Turnos de hoy
 * @property {number} pending - Turnos pendientes
 * @property {number} confirmed - Turnos confirmados
 * @property {number} cancelled - Turnos cancelados
 */

/**
 * @typedef {Object} PatientDashboardData
 * @property {string} name - Nombre del paciente
 * @property {string} nextAppointment - Próximo turno
 * @property {number} totalAppointments - Total de turnos
 * @property {number} completed - Turnos completados
 * @property {number} pending - Turnos pendientes
 */

/**
 * @typedef {Object} ProfessionalDashboardData
 * @property {string} name - Nombre del profesional
 * @property {string} specialty - Especialidad
 * @property {number} todayAppointments - Turnos de hoy
 * @property {number} pending - Turnos pendientes hoy
 * @property {number} confirmed - Turnos confirmados hoy
 * @property {number} cancelled - Turnos cancelados hoy
 */

/**
 * @typedef {Object} PatientListItem
 * @property {number} id - ID del paciente
 * @property {string} name - Nombre del paciente
 * @property {string} date - Fecha del turno
 * @property {string} time - Hora del turno
 * @property {string} status - Estado: Pendiente, Confirmado, Cancelado
 * @property {string} specialty - Especialidad
 * @property {string} [phone] - Teléfono
 */

/**
 * @typedef {Object} TimeSlot
 * @property {string} time - Hora en formato HH:MM
 * @property {boolean} isOccupied - Indica si está ocupado
 * @property {boolean} isPending - Indica si está pendiente
 * @property {string|null} patient - Nombre del paciente o null
 */

/**
 * @typedef {Object} DailyDataPoint
 * @property {string} day - Día de la semana abreviado
 * @property {string} date - Fecha en formato YYYY-MM-DD
 * @property {number} count - Total de turnos
 * @property {number} confirmed - Turnos confirmados
 */

/**
 * @typedef {Object} MonthlyDataPoint
 * @property {string} month - Mes abreviado
 * @property {number} year - Año
 * @property {number} count - Total de turnos
 * @property {number} confirmed - Turnos confirmados
 * @property {number} revenue - Facturación del mes
 */

/**
 * Componente principal del Dashboard con vista dual (Paciente/Profesional).
 * Gestiona estadísticas, calendario, turnos y análisis de negocio.
 *
 * Características:
 * - Vista de Paciente: Calendario personal, acciones rápidas, estadísticas
 * - Vista de Profesional: KPIs, gestión de turnos, facturación, gráficos
 * - Integración con AppointmentContext para gestión de estado
 * - Componentes BI: ProfessionalStats, CapacityHeatmap
 * - Eventos custom para cambio de rol (selectRole)
 *
 * @returns {JSX.Element} Dashboard completo con selección de rol
 */
const Dashboard = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectMessage, setRejectMessage] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [consultationPrice] = useState(30000); // Precio por consulta
  const [professionalStats, setProfessionalStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('mes'); // hoy, semana, mes, año
  
  // Estados para Facturación
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const [generandoFactura, setGenerandoFactura] = useState(false);
  const [turnoFacturando, setTurnoFacturando] = useState(null);

  const { appointments, loading, updateAppointment } = useContext(AppointmentContext);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      if (userObj.isProfessional) {
        setSelectedRole('profesional');
        // Cargar estadísticas del profesional
        fetchProfessionalStats();
      }
    }

    // Escuchar eventos de cambio de rol desde el UserAvatar
    const handleRoleChange = (event) => {
      setSelectedRole(event.detail);
      if (event.detail === 'profesional') {
        fetchProfessionalStats();
      }
    };

    window.addEventListener('selectRole', handleRoleChange);
    
    return () => {
      window.removeEventListener('selectRole', handleRoleChange);
    };
  }, []);

  /**
   * Obtiene estadísticas del profesional desde el backend.
 * Se filtra por periodo (hoy, semana, mes, año).
 *
 * @param {string} [period=selectedPeriod] - Periodo de análisis
 * @returns {Promise<void>} Actualiza estado professionalStats
 */
  const fetchProfessionalStats = async (period = selectedPeriod) => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const response = await backendAPI.get('/stats/professional', {
          params: { periodo: period }
        });
        setProfessionalStats(response.data);
        setStatsError('');
      }
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setStatsError('Error al cargar las estadísticas');
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * Cambia el periodo de análisis y recarga estadísticas.
 *
 * @param {string} period - Nuevo periodo: hoy, semana, mes, año
 * @returns {void}
 */
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchProfessionalStats(period);
  };

  // Calcular facturación basada en turnos confirmados
  useEffect(() => {
    if (selectedRole === 'profesional' && professionalStats) {
      // Mostrar la facturación proyectada de los turnos confirmados + completados
      const turnosCobradosOConfirmados = (professionalStats.turnosPorEstado?.confirmado || 0) + (professionalStats.turnosPorEstado?.completado || 0);
      setTotalRevenue(turnosCobradosOConfirmados * professionalStats.costoConsulta);
    } else {
      const confirmedAppointments = appointments.filter(apt => apt.status === 'Confirmado');
      const revenue = confirmedAppointments.length * consultationPrice;
      setTotalRevenue(revenue);
    }
  }, [appointments, consultationPrice, selectedRole, professionalStats]);

  /**
   * Actualiza el estado de un turno mediante AppointmentContext.
 * Estados válidos: Pendiente, Confirmado, Cancelado.
 *
 * @param {number} appointmentId - ID del turno
 * @param {string} newStatus - Nuevo estado
 * @returns {Promise<void>} Actualiza estado del turno
 */
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        await updateAppointment(appointmentId, {
          ...appointment,
          status: newStatus
        });
      }
    } catch (error) {
      console.error('Error al actualizar el estado del turno:', error);
    }
  };

  /**
   * Abre modal de rechazo para un turno pendiente.
 *
 * @param {Object} appointment - Datos del turno
 * @param {number} appointment.id - ID del turno
 * @param {string} appointment.patientName - Nombre del paciente
 * @returns {void}
 */
  const handleReject = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRejectModal(true);
  };

  /**
   * Confirma el rechazo del turno con mensaje opcional.
 * Actualiza estado a Cancelado y cierra modal.
 *
 * @returns {Promise<void>} Procesa rechazo
 */
  const confirmReject = async () => {
    if (selectedAppointment && rejectMessage.trim()) {
      await handleStatusChange(selectedAppointment.id, 'Cancelado');
      setShowRejectModal(false);
      setRejectMessage('');
      setSelectedAppointment(null);
      // Aquí podrías enviar el mensaje al paciente
      console.log(`Mensaje de rechazo enviado: ${rejectMessage}`);
    }
  };

  /**
   * Cancela el modal de rechazo y limpia estado.
   *
   * @returns {void}
   */
  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectMessage('');
    setSelectedAppointment(null);
  };

  /**
   * Genera factura para un turno completado.
   */
  const handleGenerarFactura = async (paciente) => {
    try {
      setGenerandoFactura(true);
      setTurnoFacturando(paciente.id);
      const response = await backendAPI.post('/billing/invoice', {
        appointmentId: paciente.id
      });
      setFacturaData(response.data);
      setShowFacturaModal(true);
      toast.success('Factura generada con éxito');
      fetchProfessionalStats(); // Refrescar estadísticas
    } catch (err) {
      console.error('Error al generar factura:', err);
      if (err.response?.status === 409) {
        handleVerFactura(paciente);
      } else {
        toast.error('Error al generar factura: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setGenerandoFactura(false);
      setTurnoFacturando(null);
    }
  };

  /**
   * Recupera comprobante de facturación existente.
   */
  const handleVerFactura = async (paciente) => {
    try {
      const response = await backendAPI.get(`/billing/invoice/${paciente.id}`);
      setFacturaData(response.data);
      setShowFacturaModal(true);
    } catch (err) {
      console.error('Error al obtener factura:', err);
      toast.error('Error al obtener factura: ' + (err.response?.data?.error || err.message));
    }
  };

  /**
   * Genera datos de turnos por día para los últimos 7 días.
 * Utilizado en gráfico de barras de actividad diaria.
 *
 * @returns {Array<DailyDataPoint>} Datos de los últimos 7 días
 */
  const generateDailyData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => apt.datetime.startsWith(dateStr));
      last7Days.push({
        day: date.toLocaleDateString('es-AR', { weekday: 'short' }),
        date: dateStr,
        count: dayAppointments.length,
        confirmed: dayAppointments.filter(apt => apt.status === 'Confirmado').length
      });
    }
    return last7Days;
  };

  /**
   * Genera datos de facturación por mes para los últimos 6 meses.
 * Calcula revenue basado en turnos confirmados.
 *
 * @returns {Array<MonthlyDataPoint>} Datos de los últimos 6 meses
 */
  const generateMonthlyData = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthAppointments = appointments.filter(apt => 
        apt.datetime.startsWith(monthStr)
      );
      last6Months.push({
        month: date.toLocaleDateString('es-AR', { month: 'short' }),
        year: date.getFullYear(),
        count: monthAppointments.length,
        confirmed: monthAppointments.filter(apt => apt.status === 'Confirmado').length,
        revenue: monthAppointments.filter(apt => apt.status === 'Confirmado').length * consultationPrice
      });
    }
    return last6Months;
  };

  // Calcular estadísticas reales
  const today = new Date().toISOString().split('T')[0];
  
  // Utilizar la lista de turnos del contexto para pacientes, y los del professionalStats para profesionales
  const activeAppointments = selectedRole === 'profesional' && professionalStats?.pacientes 
    ? professionalStats.pacientes.map(p => ({
        id: p.id,
        patientName: p.nombre,
        datetime: `${p.fecha.split('T')[0]}T${p.hora}:00`,
        status: p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
        specialty: p.especialidad || "Medicina General",
        phone: p.telefono
      }))
    : appointments;

  const todayAppointments = activeAppointments.filter(apt => apt.datetime.startsWith(today));
  
  const stats = {
    total: appointments.length,
    today: appointments.filter(apt => apt.datetime.startsWith(today)).length,
    pending: appointments.filter(apt => apt.status === 'Pendiente').length,
    confirmed: appointments.filter(apt => apt.status === 'Confirmado').length,
    cancelled: appointments.filter(apt => apt.status === 'Cancelado').length
  };

  // Datos del paciente usando datos reales
  const patientData = {
    name: appointments.length > 0 ? appointments[0].patientName : "Paciente",
    nextAppointment: appointments.find(apt => apt.status === 'Pendiente')?.datetime || "Sin turnos pendientes",
    totalAppointments: appointments.length,
    completed: appointments.filter(apt => apt.status === 'Confirmado').length,
    pending: appointments.filter(apt => apt.status === 'Pendiente').length
  };

  // Datos del profesional usando datos reales combinados con stats
  const professionalData = {
    name: user ? user.nombre : "Dr. Profesional",
    specialty: user ? user.especialidad : "Medicina General",
    todayAppointments: professionalStats?.hoy?.totalTurnos || todayAppointments.length,
    pending: todayAppointments.filter(apt => apt.status === 'Pendiente').length,
    confirmed: todayAppointments.filter(apt => apt.status === 'Confirmado').length,
    cancelled: todayAppointments.filter(apt => apt.status === 'Cancelado').length
  };

  // Lista de pacientes real ordenada por fecha
  const patientsList = activeAppointments
    .filter(apt => apt.datetime.startsWith(today))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    .map(apt => ({
      id: apt.id,
      name: apt.patientName,
      date: apt.datetime.split('T')[0],
      time: apt.datetime.split('T')[1]?.substring(0, 5) || "00:00",
      status: apt.status,
      specialty: "Medicina General", // Por defecto
      phone: apt.phone
    }));

  // Horarios del día (8:00 a 18:00)
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Usar datos reales para determinar si está ocupado
    const appointmentAtTime = todayAppointments.find(apt => {
      const aptTime = apt.datetime.split('T')[1]?.substring(0, 5);
      return aptTime === time;
    });
    
    return {
      time,
      isOccupied: !!appointmentAtTime,
      isPending: appointmentAtTime?.status === 'Pendiente',
      patient: appointmentAtTime?.patientName || null
    };
  });

  /**
   * Genera array de días para el calendario mensual.
 * Incluye días del mes anterior y siguiente para completar grilla 6x7.
 *
 * @returns {Array<Date>} 42 días (6 semanas x 7 días)
 */
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (selectedRole === 'paciente') {
    return (
      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header del Dashboard del Paciente */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">Dashboard del Paciente</h1>
            <p className="text-gray-600">Gestioná tus turnos médicos de manera simple</p>
            <button
              onClick={() => setSelectedRole(null)}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 underline"
            >
              ← Volver a selección
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Información del Paciente */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{patientData.name}</h3>
                    <p className="text-gray-600">Paciente</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Próximo turno</p>
                      <p className="font-medium text-gray-900">{patientData.nextAppointment}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{patientData.totalAppointments}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{patientData.completed}</p>
                      <p className="text-sm text-gray-600">Completados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{patientData.pending}</p>
                      <p className="text-sm text-gray-600">Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-blue-700">Nuevo Turno</span>
                  </button>
                  <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-green-700">Mis Turnos</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Calendario 1:1 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendario</h3>
              <div className="aspect-square">
                <div className="grid grid-cols-7 gap-1 h-full">
                  {/* Días de la semana */}
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-sm font-medium text-gray-500 flex items-center justify-center">
                      {day}
                    </div>
                  ))}
                  
                  {/* Días del mes (simulado) */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i + 1;
                    const hasAppointment = [5, 12, 19, 26].includes(day);
                    const isToday = day === 25;
                    
                    return (
                      <div
                        key={i}
                        className={`text-center text-sm rounded-lg cursor-pointer transition-colors flex items-center justify-center ${
                          isToday 
                            ? 'bg-blue-100 text-blue-700 font-semibold' 
                            : hasAppointment
                              ? 'bg-green-100 text-green-700'
                              : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div className="relative">
                          {day}
                          {hasAppointment && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRole === 'profesional') {
    return (
      <div className="py-8 px-6 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header del Dashboard del Profesional */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">Dashboard del Profesional</h1>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Gestioná tu consultorio y turnos médicos</p>
            <button
              onClick={() => setSelectedRole(null)}
              className="mt-4 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-300"
            >
              ← Volver a selección
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Perfil del Profesional */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                    <Stethoscope className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{professionalData.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{professionalData.specialty}</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full mt-2 transition-colors duration-300">
                      Activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Resumen del Día</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Total turnos</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{professionalData.todayAppointments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Confirmados</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{professionalData.confirmed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Pendientes</span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 transition-colors duration-300">{professionalData.pending}</span>
                  </div>
                </div>
              </div>

              {/* Facturación */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Facturación
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Total facturado</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                      ${totalRevenue.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Precio por consulta</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      ${consultationPrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Consultas realizadas</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                      {activeAppointments.filter(apt => apt.status === 'Confirmado' || apt.status === 'Completado').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calendario del Profesional */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Calendario</h3>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors duration-300 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors duration-300 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1 transition-colors duration-300">
                      {day}
                    </div>
                  ))}
                  
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    // Fijarse en todos los turnos activos, no solo los de hoy
                    const hasAppointments = activeAppointments.some(apt => apt.datetime.startsWith(day.toISOString().slice(0, 10)));
                    
                    return (
                      <div
                        key={index}
                        className={`text-center text-xs rounded p-1 cursor-pointer transition-colors duration-300 ${
                          isToday 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' 
                            : hasAppointments
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : isCurrentMonth 
                                ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700' 
                                : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <div className="relative">
                          {day.getDate()}
                          {hasAppointments && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selector de Periodo */}
              {selectedRole === 'profesional' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📊 Período de Análisis
                    </h3>
                    <div className="flex gap-2">
                      {['hoy', 'semana', 'mes', 'año'].map((period) => (
                        <button
                          key={period}
                          onClick={() => handlePeriodChange(period)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedPeriod === period
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ProfessionalStats - Tu Consultorio */}
              <ProfessionalStats 
                stats={professionalStats} 
                loading={statsLoading} 
                error={statsError} 
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
              />

              {/* CapacityHeatmap - Matriz de Capacidad Operativa */}
              <CapacityHeatmap />

              {/* KPIs Principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-xl p-4 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-colors duration-300">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Hoy</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 transition-colors duration-300">{professionalData.todayAppointments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-xl p-4 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center transition-colors duration-300">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Pendientes</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 transition-colors duration-300">{professionalData.pending}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-xl p-4 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center transition-colors duration-300">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Confirmados</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{professionalData.confirmed}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-xl p-4 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center transition-colors duration-300">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Cancelados</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">{professionalData.cancelled}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sistema de Tablas por Categoría (Grid 2x2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Turnos Pendientes (Acción Inmediata) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 flex flex-col h-[400px]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Pendientes
                  </h3>
                  <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                    {activeAppointments.filter(apt => apt.status === 'Pendiente').length > 0 ? (
                      activeAppointments.filter(apt => apt.status === 'Pendiente').map(apt => (
                        <div key={apt.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg">
                          <p className="font-medium text-gray-900 dark:text-white">{apt.patientName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{apt.datetime.split('T')[1].substring(0,5)} hs</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusChange(apt.id, 'Confirmado')} className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded hover:bg-green-600 transition-colors">Confirmar</button>
                            <button onClick={() => handleStatusChange(apt.id, 'Cancelado')} className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded hover:bg-red-600 transition-colors">Rechazar</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Sin pendientes</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Turnos Confirmados (Agenda del Día) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 flex flex-col h-[400px]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Confirmados
                  </h3>
                  <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                    {activeAppointments.filter(apt => apt.status === 'Confirmado').length > 0 ? (
                      activeAppointments.filter(apt => apt.status === 'Confirmado').map(apt => (
                        <div key={apt.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{apt.patientName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{apt.datetime.split('T')[0]} - {apt.datetime.split('T')[1].substring(0,5)} hs</p>
                          </div>
                          <button onClick={() => handleStatusChange(apt.id, 'Completado')} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors" title="Marcar como Atendido">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Calendar className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Sin turnos confirmados</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Turnos Atendidos/Completados (Historial) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 flex flex-col h-[400px]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Atendidos / Completados
                  </h3>
                  <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                    {activeAppointments.filter(apt => apt.status === 'Completado').length > 0 ? (
                      activeAppointments.filter(apt => apt.status === 'Completado').map(apt => (
                        <div key={apt.id} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{apt.patientName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{apt.datetime.split('T')[0]} - {apt.datetime.split('T')[1].substring(0,5)} hs</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <span className="text-xs font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">Completado</span>
                            {apt.facturado || apt.cae_number ? (
                              <button
                                onClick={() => handleVerFactura(apt)}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                Ver Factura
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGenerarFactura(apt)}
                                disabled={generandoFactura && turnoFacturando === apt.id}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {generandoFactura && turnoFacturando === apt.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    ...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3 h-3" />
                                    Facturar
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Sin pacientes atendidos</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Turnos Cancelados (Historial) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 flex flex-col h-[400px]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-500" />
                    Cancelados
                  </h3>
                  <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                    {activeAppointments.filter(apt => apt.status === 'Cancelado').length > 0 ? (
                      activeAppointments.filter(apt => apt.status === 'Cancelado').map(apt => (
                        <div key={apt.id} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-through opacity-75">{apt.patientName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{apt.datetime.split('T')[0]} - {apt.datetime.split('T')[1].substring(0,5)} hs</p>
                          </div>
                          <span className="text-xs font-semibold bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded">Cancelado</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <X className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Sin cancelaciones</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Horarios del Día */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Horarios del Día</h3>
                <div className="grid grid-cols-7 gap-2">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center text-xs rounded-lg border-2 ${
                        slot.isOccupied
                          ? slot.isPending
                            ? 'bg-orange-500 border-orange-600 text-white font-medium'
                            : 'bg-green-500 border-green-600 text-white font-medium'
                          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{slot.time}</div>
                      {slot.isOccupied && (
                        <div className="text-xs mt-1 truncate">
                          {slot.patient}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 border border-green-600 rounded"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Confirmado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 border border-orange-600 rounded"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Pendiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Libre</span>
                  </div>
                </div>
              </div>




            </div>
          </div>
        </div>

        {/* Modal de Rechazo */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-[95%] sm:max-w-md w-full p-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                  <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  Rechazar Turno
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Paciente: <span className="font-medium text-gray-900 dark:text-white">{selectedAppointment?.patientName}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Fecha: <span className="font-medium text-gray-900 dark:text-white">
                    {selectedAppointment ? new Date(selectedAppointment.datetime).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Mensaje de rechazo (opcional)
                </label>
                <textarea
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  placeholder="Ej: No hay disponibilidad en ese horario, por favor selecciona otro turno..."
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors duration-300 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelReject}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectMessage.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rechazar Turno
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal de Factura */}
      {showFacturaModal && facturaData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowFacturaModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <FacturaPreview factura={facturaData} />
          </div>
        </div>
      )}

      </div>
    );
  }

  // Página de selección de rol
  return (
    <div className="py-16 px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-bold text-blue-700 mb-6">
              Monitoreo y estadísticas de citas médicas 📊  
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Esta es una prueba de cómo se ve tu cuenta registrándote
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Seleccioná tu tipo de usuario para ver el dashboard correspondiente
            </p>
          </div>
        </div>


        {/* Opciones de Usuario */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Soy Paciente */}
          <div 
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => setSelectedRole('paciente')}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Soy Paciente</h3>
              <p className="text-gray-600 mb-6">
                Accedé a tu calendario personal, gestioná tus turnos y mantené un control de tu agenda médica
              </p>
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-700 mb-2">Características:</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Calendario personal 1:1</li>
                  <li>• Historial de turnos</li>
                  <li>• Próximas citas</li>
                  <li>• Acciones rápidas</li>
                </ul>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Ver Dashboard del Paciente
              </button>
            </div>
          </div>

          {/* Soy Profesional */}
          <div 
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => setSelectedRole('profesional')}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-4">Soy Profesional</h3>
              <p className="text-gray-600 mb-6">
                Gestioná tu consultorio, administrá turnos y mantené el control total de tu agenda médica
              </p>
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-green-700 mb-2">Características:</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• KPIs y estadísticas</li>
                  <li>• Gestión de turnos</li>
                  <li>• Vista del consultorio</li>
                  <li>• Reportes y análisis</li>
                </ul>
              </div>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                Ver Dashboard del Profesional
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
