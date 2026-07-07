import React, { useState, useEffect } from 'react';
import { Calendar, User, Stethoscope, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTurnosEstadisticas } from '../hooks/useTurnosContext';

const Dashboard = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState(null);
  
  const { estadisticas, loading } = useTurnosEstadisticas();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      if (userObj.isProfessional) {
        setSelectedRole('profesional');
      }
    }
  }, []);

  // Calcular estadísticas reales usando el nuevo contexto
  const today = new Date().toISOString().split('T')[0];
  const todayTurnos = estadisticas.turnosHoy || [];
  
  // Datos de ejemplo para mostrar funcionalidad completa
  const stats = {
    total: 37,   // Total de turnos con datos de ejemplo
    today: 8,    // Turnos del día
    pending: 5,  // Turnos pendientes 
    completed: 28,  // Turnos completados
    cancelled: 4    // Turnos cancelados
  };

  // Datos del paciente usando estadísticas del contexto
  const patientData = {
    name: user ? user.nombre : "Paciente",
    nextAppointment: estadisticas.proximoTurno || "Sin turnos pendientes",
    totalAppointments: estadisticas.totalTurnos || 0,
    completed: estadisticas.turnosConfirmados || 0,
    pending: estadisticas.turnosPendientes || 0
  };

  // Datos del profesional usando estadísticas del contexto
  const professionalData = {
    name: user ? user.nombre : "Dr. Profesional",
    specialty: user ? user.especialidad : "Medicina General",
    todayAppointments: stats.today,
    pending: stats.pending,
    completed: stats.completed,
    cancelled: stats.cancelled
  };

  // Lista de pacientes con datos de ejemplo para mostrar funcionalidades
  const examplePatients = [
    {
      id: 1,
      name: "María González",
      date: today,
      time: "09:00",
      status: "confirmado",
      specialty: "Cardiología",
      phone: "11-1234-5678",
      priority: "alta"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      date: today,
      time: "10:30",
      status: "pendiente",
      specialty: "Dermatología",
      phone: "11-2345-6789",
      priority: "media"
    },
    {
      id: 3,
      name: "Ana Martínez",
      date: today,
      time: "11:00",
      status: "confirmado",
      specialty: "Traumatología",
      phone: "11-3456-7890",
      priority: "baja"
    },
    {
      id: 4,
      name: "Luis Pérez",
      date: today,
      time: "14:00",
      status: "pendiente",
      specialty: "Neurología",
      phone: "11-4567-8901",
      priority: "alta"
    },
    {
      id: 5,
      name: "Sofia López",
      date: today,
      time: "15:30",
      status: "confirmado",
      specialty: "Ginecología",
      phone: "11-5678-9012",
      priority: "media"
    },
    {
      id: 6,
      name: "Roberto Silva",
      date: today,
      time: "16:00",
      status: "pendiente",
      specialty: "Oftalmología",
      phone: "11-6789-0123",
      priority: "baja"
    },
    {
      id: 7,
      name: "Carmen Vega",
      date: today,
      time: "17:00",
      status: "confirmado",
      specialty: "Endocrinología",
      phone: "11-7890-1234",
      priority: "alta"
    },
    {
      id: 8,
      name: "Diego Morales",
      date: today,
      time: "17:30",
      status: "pendiente",
      specialty: "Psicología",
      phone: "11-8901-2345",
      priority: "media"
    }
  ];
  
  const patientsList = examplePatients;

  // Horarios del día (8:00 a 18:00) con datos de ejemplo
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Buscar si hay un turno en este horario
    const turnoAtTime = patientsList.find(patient => patient.time === time);
    
    return {
      time,
      isOccupied: !!turnoAtTime,
      isPending: turnoAtTime?.status === 'pendiente',
      patient: turnoAtTime?.name || null,
      specialty: turnoAtTime?.specialty || null,
      priority: turnoAtTime?.priority || null
    };
  });

  // Generar datos del calendario
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

  // Datos de ejemplo para gráficos de estadísticas
  const chartData = {
    weeklyStats: [12, 19, 15, 25, 22, 18, 14], // Lunes a Domingo
    monthlyStats: [45, 52, 48, 61, 58, 49, 55, 62, 58, 51, 47, 53], // Enero a Diciembre
    specialtyDistribution: [
      { name: 'Cardiología', value: 25, color: '#3B82F6' },
      { name: 'Dermatología', value: 20, color: '#10B981' },
      { name: 'Traumatología', value: 18, color: '#F59E0B' },
      { name: 'Neurología', value: 15, color: '#EF4444' },
      { name: 'Ginecología', value: 12, color: '#8B5CF6' },
      { name: 'Oftalmología', value: 10, color: '#06B6D4' }
    ],
    patientSatisfaction: [
      { month: 'Ene', rating: 4.2 },
      { month: 'Feb', rating: 4.4 },
      { month: 'Mar', rating: 4.1 },
      { month: 'Abr', rating: 4.6 },
      { month: 'May', rating: 4.3 },
      { month: 'Jun', rating: 4.5 }
    ],
    // Datos para gráfico de barras por día del mes
    dailyStats: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const baseTurnos = Math.floor(Math.random() * 8) + 3; // 3-10 turnos por día
      return {
        day,
        turnos: baseTurnos,
        completados: Math.floor(baseTurnos * 0.7), // 70% completados
        pendientes: Math.floor(baseTurnos * 0.2), // 20% pendientes
        cancelados: Math.floor(baseTurnos * 0.1)  // 10% cancelados
      };
    })
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
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 flex items-center justify-center">
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
      <div className="py-8 px-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header del Dashboard del Profesional */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">Dashboard del Profesional</h1>
            <p className="text-gray-600 dark:text-gray-300">Gestioná tu consultorio y turnos médicos</p>
            <button
              onClick={() => setSelectedRole(null)}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 underline"
            >
              ← Volver a selección
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Perfil del Profesional */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{professionalData.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{professionalData.specialty}</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full mt-2">
                      Activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumen del Día</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Total turnos</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Completados</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Pendientes</span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                  </div>
                </div>
              </div>

              {/* Calendario del Profesional */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Calendario</h3>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h4 className="text-sm font-medium text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                      {day}
                    </div>
                  ))}
                  
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    const hasAppointments = patientsList.some(p => p.date === day.toISOString().slice(0, 10));
                    
                    return (
                      <div
                        key={index}
                        className={`text-center text-xs rounded p-1 cursor-pointer transition-colors ${
                          isToday 
                            ? 'bg-blue-100 text-blue-700 font-semibold' 
                            : hasAppointments
                              ? 'bg-green-100 text-green-700'
                              : isCurrentMonth 
                                ? 'text-gray-900 hover:bg-gray-100' 
                                : 'text-gray-400'
                        }`}
                      >
                        <div className="relative">
                          {day.getDate()}
                          {hasAppointments && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
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
              {/* KPIs Principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{professionalData.todayAppointments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completados</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{professionalData.completed}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{professionalData.pending}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cancelados</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{professionalData.cancelled}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Pacientes */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pacientes del Día</h3>
                <div className="space-y-3">
                  {patientsList
                    .filter(p => p.date === new Date().toISOString().slice(0, 10))
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .length > 0 ? (
                    patientsList
                      .filter(p => p.date === new Date().toISOString().slice(0, 10))
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((patient) => (
                        <div key={patient.id} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 ${
                          patient.status === 'Confirmado' 
                            ? 'border-l-green-500' :
                          patient.status === 'Pendiente' 
                            ? 'border-l-yellow-500' :
                          patient.status === 'Cancelado'
                            ? 'border-l-red-500' :
                            'border-l-gray-400'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.specialty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{patient.time}</p>
                            <div className="flex items-center justify-end gap-2">
                              {patient.status === 'Confirmado' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {patient.status === 'Pendiente' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                              {patient.status === 'Cancelado' && <AlertCircle className="w-4 h-4 text-red-500" />}
                              <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                                patient.status === 'Confirmado' 
                                  ? 'bg-green-500 text-white shadow-sm' :
                                patient.status === 'Pendiente' 
                                  ? 'bg-yellow-500 text-white shadow-sm' :
                                patient.status === 'Cancelado'
                                  ? 'bg-red-500 text-white shadow-sm' :
                                  'bg-gray-500 text-white shadow-sm'
                              }`}>
                                {patient.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No hay pacientes programados para hoy</p>
                        <p className="text-sm">Tu agenda está libre para el día de hoy</p>
                      </div>
                    )}
                </div>
              </div>

              {/* Horarios del Día */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios del Día</h3>
                <div className="grid grid-cols-7 gap-2">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center text-xs rounded-lg border-2 ${
                        slot.isOccupied
                          ? slot.isPending
                            ? 'bg-yellow-500 border-yellow-600 text-white font-medium'
                            : 'bg-green-500 border-green-600 text-white font-medium'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
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
                    <span className="font-medium">Confirmado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 border border-yellow-600 rounded"></div>
                    <span className="font-medium">Pendiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                    <span className="font-medium">Libre</span>
                  </div>
                </div>
              </div>

              {/* Cuadro eliminado: Distribución por Estado */}
              
              {/* Gráfico de Líneas - Evolución Semanal */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Evolución Semanal</h3>
                <div className="space-y-4">
                  {/* Gráfico de líneas simple */}
                  <div className="h-32 flex items-end justify-between gap-2">
                    {[
                      { dia: 'Lun', turnos: 7 },
                      { dia: 'Mar', turnos: 7 },
                      { dia: 'Mié', turnos: 4 },
                      { dia: 'Jue', turnos: 9 },
                      { dia: 'Vie', turnos: 2 },
                      { dia: 'Sáb', turnos: 2 },
                      { dia: 'Dom', turnos: 2 }
                    ].map(({ dia, turnos }) => {
                      const altura = (turnos / 10) * 100; // Normalizar a porcentaje
                      return (
                        <div key={dia} className="flex-1 flex flex-col items-center">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{turnos}</div>
                          <div 
                            className="w-full bg-blue-500 rounded-t transition-all duration-500"
                            style={{ height: `${altura}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dia}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Estadísticas semanales */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Total Turnos</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Completados</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Página de selección de rol
  return (
    <div className="py-16 px-6 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mb-6">
              Monitoreo y estadísticas de citas médicas 📊  
          </h1>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
              Esta es una prueba de cómo se ve tu cuenta registrándote
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Seleccioná tu tipo de usuario para ver el dashboard correspondiente
            </p>
          </div>
        </div>


        {/* Opciones de Usuario */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Soy Paciente */}
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => setSelectedRole('paciente')}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4">Soy Paciente</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Accedé a tu calendario personal, gestioná tus turnos y mantené un control de tu agenda médica
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Características:</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => setSelectedRole('profesional')}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">Soy Profesional</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Gestioná tu consultorio, administrá turnos y mantené el control total de tu agenda médica
              </p>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Características:</h4>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
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


