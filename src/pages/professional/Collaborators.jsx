import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Users, Plus, Edit, Trash2, UserPlus, Shield, Mail, Phone, Calendar, Save, X } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';

const Collaborators = () => {
  const { user } = useUser();
  const [collaborators, setCollaborators] = useState([
    {
      id: 1,
      nombre: 'Dr. María González',
      email: 'maria.gonzalez@consultorio.com',
      telefono: '+54 11 1234-5678',
      rol: 'Médico Asistente',
      especialidad: 'Cardiología',
      estado: 'Activo',
      fechaIngreso: '2024-01-15',
      permisos: ['ver_turnos', 'editar_pacientes']
    },
    {
      id: 2,
      nombre: 'Lic. Juan Pérez',
      email: 'juan.perez@consultorio.com',
      telefono: '+54 11 2345-6789',
      rol: 'Recepcionista',
      especialidad: 'Administrativo',
      estado: 'Activo',
      fechaIngreso: '2024-02-01',
      permisos: ['ver_turnos', 'crear_turnos']
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    especialidad: '',
    permisos: []
  });

  const [errors, setErrors] = useState({});

  const roles = [
    'Médico Asistente',
    'Recepcionista',
    'Enfermero/a',
    'Administrativo',
    'Especialista'
  ];

  const especialidades = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Ortopedia',
    'Neurología',
    'Psicología',
    'Nutrición',
    'Odontología',
    'Administrativo'
  ];

  const permisosDisponibles = [
    { id: 'ver_turnos', label: 'Ver turnos' },
    { id: 'crear_turnos', label: 'Crear turnos' },
    { id: 'editar_turnos', label: 'Editar turnos' },
    { id: 'eliminar_turnos', label: 'Eliminar turnos' },
    { id: 'ver_pacientes', label: 'Ver pacientes' },
    { id: 'editar_pacientes', label: 'Editar pacientes' },
    { id: 'ver_reportes', label: 'Ver reportes' },
    { id: 'administrar_sistema', label: 'Administrar sistema' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        permisos: checked 
          ? [...prev.permisos, value]
          : prev.permisos.filter(p => p !== value)
      }));
    } else if (name === 'telefono') {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
      
      // Limpiar error del campo
      if (errors.telefono) {
        setErrors(prev => ({ ...prev, telefono: '' }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar teléfono antes de guardar
    const phoneValidation = validateArgentinePhone(form.telefono);
    if (!phoneValidation.isValid) {
      setErrors(prev => ({ ...prev, telefono: phoneValidation.message }));
      return;
    }
    
    // Limpiar teléfono para guardar
    const formToSave = {
      ...form,
      telefono: cleanPhoneForStorage(form.telefono)
    };
    
    if (editingId) {
      // Editar colaborador existente
      setCollaborators(prev => prev.map(col => 
        col.id === editingId 
          ? { ...col, ...formToSave, id: editingId }
          : col
      ));
      setEditingId(null);
    } else {
      // Agregar nuevo colaborador
      const newCollaborator = {
        ...formToSave,
        id: Date.now(),
        estado: 'Activo',
        fechaIngreso: new Date().toISOString().split('T')[0]
      };
      setCollaborators(prev => [...prev, newCollaborator]);
    }
    
    setForm({
      nombre: '',
      email: '',
      telefono: '',
      rol: '',
      especialidad: '',
      permisos: []
    });
    setErrors({});
    setShowAddForm(false);
  };

  const handleEdit = (collaborator) => {
    setForm({
      nombre: collaborator.nombre,
      email: collaborator.email,
      telefono: collaborator.telefono,
      rol: collaborator.rol,
      especialidad: collaborator.especialidad,
      permisos: collaborator.permisos
    });
    setEditingId(collaborator.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      setCollaborators(prev => prev.filter(col => col.id !== id));
    }
  };

  const handleCancel = () => {
    setForm({
      nombre: '',
      email: '',
      telefono: '',
      rol: '',
      especialidad: '',
      permisos: []
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="p-8 w-full bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">Colaboradores</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestioná tu equipo de trabajo y asigná permisos</p>
        </div>

        {/* Botón agregar */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Colaborador
          </button>
        </div>

        {/* Formulario de agregar/editar */}
        {showAddForm && (
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingId ? 'Editar Colaborador' : 'Agregar Nuevo Colaborador'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    placeholder="54XXXXXXXXXX (12 dígitos)"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ${
                      errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Formato: 54 + 10 dígitos (ej: 543834788937)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</label>
                  <select
                    name="rol"
                    value={form.rol}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(rol => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Especialidad</label>
                  <select
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permisos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permisos</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {permisosDisponibles.map(permiso => (
                    <label key={permiso.id} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer bg-white dark:bg-slate-700">
                      <input
                        type="checkbox"
                        value={permiso.id}
                        checked={form.permisos.includes(permiso.id)}
                        onChange={handleChange}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{permiso.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

        {/* Lista de colaboradores */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Colaborador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Ingreso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {collaborators.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{collaborator.nombre}</div>
                          <div className="text-sm text-gray-500">{collaborator.email}</div>
                          <div className="text-sm text-gray-500">{collaborator.telefono}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{collaborator.rol}</div>
                        <div className="text-sm text-gray-500">{collaborator.especialidad}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        collaborator.estado === 'Activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {collaborator.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {collaborator.fechaIngreso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(collaborator)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(collaborator.id)}
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
      </div>
    </div>
  );
};

export default Collaborators;
