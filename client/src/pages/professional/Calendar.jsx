import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Calendar, Plus, Edit, Trash2, Save, X, Clock, MapPin, Users, Settings } from 'lucide-react';

const ProfessionalCalendar = () => {
  const { user } = useUser();
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      dia: 'Lunes',
      horarioInicio: '09:00',
      horarioFin: '18:00',
      duracionTurno: 30,
      pausaAlmuerzo: true,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín',
      estado: 'Activo'
    },
    {
      id: 2,
      dia: 'Martes',
      horarioInicio: '09:00',
      horarioFin: '18:00',
      duracionTurno: 30,
      pausaAlmuerzo: true,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín',
      estado: 'Activo'
    },
    {
      id: 3,
      dia: 'Miércoles',
      horarioInicio: '09:00',
      horarioFin: '18:00',
      duracionTurno: 30,
      pausaAlmuerzo: true,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín',
      estado: 'Activo'
    },
    {
      id: 4,
      dia: 'Jueves',
      horarioInicio: '09:00',
      horarioFin: '18:00',
      duracionTurno: 30,
      pausaAlmuerzo: true,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín',
      estado: 'Activo'
    },
    {
      id: 5,
      dia: 'Viernes',
      horarioInicio: '09:00',
      horarioFin: '18:00',
      duracionTurno: 30,
      pausaAlmuerzo: true,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín',
      estado: 'Activo'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    dia: '',
    horarioInicio: '',
    horarioFin: '',
    duracionTurno: 30,
    pausaAlmuerzo: false,
    horarioAlmuerzoInicio: '13:00',
    horarioAlmuerzoFin: '14:00',
    maxPacientes: 16,
    lugar: 'Consultorio San Martín'
  });

  const dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ];

  const duracionesTurno = [15, 20, 30, 45, 60];

  const lugares = [
    'Consultorio San Martín',
    'Centro Médico Palermo',
    'Clínica Privada'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Editar horario existente
      setSchedules(prev => prev.map(schedule => 
        schedule.id === editingId 
          ? { ...schedule, ...form, id: editingId }
          : schedule
      ));
      setEditingId(null);
    } else {
      // Agregar nuevo horario
      const newSchedule = {
        ...form,
        id: Date.now(),
        estado: 'Activo'
      };
      setSchedules(prev => [...prev, newSchedule]);
    }
    
    setForm({
      dia: '',
      horarioInicio: '',
      horarioFin: '',
      duracionTurno: 30,
      pausaAlmuerzo: false,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín'
    });
    setShowAddForm(false);
  };

  const handleEdit = (schedule) => {
    setForm({
      dia: schedule.dia,
      horarioInicio: schedule.horarioInicio,
      horarioFin: schedule.horarioFin,
      duracionTurno: schedule.duracionTurno,
      pausaAlmuerzo: schedule.pausaAlmuerzo,
      horarioAlmuerzoInicio: schedule.horarioAlmuerzoInicio,
      horarioAlmuerzoFin: schedule.horarioAlmuerzoFin,
      maxPacientes: schedule.maxPacientes,
      lugar: schedule.lugar
    });
    setEditingId(schedule.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    }
  };

  const handleCancel = () => {
    setForm({
      dia: '',
      horarioInicio: '',
      horarioFin: '',
      duracionTurno: 30,
      pausaAlmuerzo: false,
      horarioAlmuerzoInicio: '13:00',
      horarioAlmuerzoFin: '14:00',
      maxPacientes: 16,
      lugar: 'Consultorio San Martín'
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const toggleScheduleStatus = (id) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? { ...schedule, estado: schedule.estado === 'Activo' ? 'Inactivo' : 'Activo' }
        : schedule
    ));
  };

  const calcularTurnosDisponibles = (schedule) => {
    const inicio = new Date(`2000-01-01T${schedule.horarioInicio}`);
    const fin = new Date(`2000-01-01T${schedule.horarioFin}`);
    const duracion = schedule.duracionTurno;
    
    let tiempoTotal = (fin - inicio) / (1000 * 60); // en minutos
    
    if (schedule.pausaAlmuerzo) {
      const almuerzoInicio = new Date(`2000-01-01T${schedule.horarioAlmuerzoInicio}`);
      const almuerzoFin = new Date(`2000-01-01T${schedule.horarioAlmuerzoFin}`);
      const tiempoAlmuerzo = (almuerzoFin - almuerzoInicio) / (1000 * 60);
      tiempoTotal -= tiempoAlmuerzo;
    }
    
    return Math.floor(tiempoTotal / duracion);
  };

  return (
    <div className="p-8 w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Calendario</h1>
          <p className="text-gray-600">Configurá tus horarios de atención y disponibilidad</p>
        </div>

        {/* Botón agregar */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Horario
          </button>
        </div>

        {/* Formulario de agregar/editar */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Horario' : 'Agregar Nuevo Horario'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Día de la semana</label>
                  <select
                    name="dia"
                    value={form.dia}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  >
                    <option value="">Seleccionar día</option>
                    {dias.map(dia => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lugar de atención</label>
                  <select
                    name="lugar"
                    value={form.lugar}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  >
                    {lugares.map(lugar => (
                      <option key={lugar} value={lugar}>{lugar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario de inicio</label>
                  <input
                    type="time"
                    name="horarioInicio"
                    value={form.horarioInicio}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario de fin</label>
                  <input
                    type="time"
                    name="horarioFin"
                    value={form.horarioFin}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duración del turno (minutos)</label>
                  <select
                    name="duracionTurno"
                    value={form.duracionTurno}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  >
                    {duracionesTurno.map(duracion => (
                      <option key={duracion} value={duracion}>{duracion} min</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de pacientes</label>
                  <input
                    type="number"
                    name="maxPacientes"
                    value={form.maxPacientes}
                    onChange={handleChange}
                    required
                    min="1"
                    max="50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pausa para almuerzo */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    name="pausaAlmuerzo"
                    checked={form.pausaAlmuerzo}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Incluir pausa para almuerzo</label>
                </div>
                
                {form.pausaAlmuerzo && (
                  <div className="grid md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inicio del almuerzo</label>
                      <input
                        type="time"
                        name="horarioAlmuerzoInicio"
                        value={form.horarioAlmuerzoInicio}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fin del almuerzo</label>
                      <input
                        type="time"
                        name="horarioAlmuerzoFin"
                        value={form.horarioAlmuerzoFin}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vista semanal del calendario */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Horarios Semanales</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{schedule.dia}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.horarioInicio} - {schedule.horarioFin}
                      </div>
                      {schedule.pausaAlmuerzo && (
                        <div className="text-xs text-gray-500">
                          Almuerzo: {schedule.horarioAlmuerzoInicio} - {schedule.horarioAlmuerzoFin}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{schedule.lugar}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {calcularTurnosDisponibles(schedule)} disponibles
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {schedule.duracionTurno} min por turno
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleScheduleStatus(schedule.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          schedule.estado === 'Activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {schedule.estado}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de la semana */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Horas de atención</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {schedules.filter(s => s.estado === 'Activo').length * 8}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Turnos disponibles</h4>
                <p className="text-2xl font-bold text-green-600">
                  {schedules
                    .filter(s => s.estado === 'Activo')
                    .reduce((total, s) => total + calcularTurnosDisponibles(s), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Días activos</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {schedules.filter(s => s.estado === 'Activo').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje si no hay horarios */}
        {schedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-600 mb-4">Configurá tus horarios de atención para comenzar a recibir pacientes</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Horario
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalCalendar;
