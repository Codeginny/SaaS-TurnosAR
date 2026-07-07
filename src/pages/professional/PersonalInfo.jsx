import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User, MapPin, Phone, Mail, Calendar, FileText, Save, Edit } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';

const PersonalInfo = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    especialidad: '',
    matricula: '',
    cuit: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: ''
  });

  // Cargar datos del usuario cuando esté disponible
  React.useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        dni: user.dni || '',
        fechaNacimiento: user.fechaNacimiento || '',
        telefono: user.telefono || '',
        email: user.email || '',
        especialidad: user.especialidad || '',
        matricula: user.matricula || '',
        cuit: user.cuit || '',
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        provincia: user.provincia || '',
        codigoPostal: user.codigoPostal || ''
      });
    }
  }, [user]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para teléfono
    if (name === 'telefono') {
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

  const handleSave = async () => {
    try {
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
      
      // Aquí iría la lógica para guardar en MockAPI
      console.log('Guardando información personal:', formToSave);
      setIsEditing(false);
      // Mostrar toast de éxito
    } catch (error) {
      console.error('Error al guardar:', error);
      // Mostrar toast de error
    }
  };

  const handleCancel = () => {
    setForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      dni: user?.dni || '',
      fechaNacimiento: user?.fechaNacimiento || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
      especialidad: user?.especialidad || '',
      matricula: user?.matricula || '',
      cuit: user?.cuit || '',
      direccion: user?.direccion || '',
      ciudad: user?.ciudad || '',
      provincia: user?.provincia || '',
      codigoPostal: user?.codigoPostal || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="p-8 w-full bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">Información Personal</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestioná tus datos personales y profesionales</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          {/* Botones de acción */}
          <div className="flex justify-end mb-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            )}
          </div>

          <form className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información Básica
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información de Contacto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="54XXXXXXXXXX (12 dígitos)"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ${
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Información profesional */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información Profesional
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Especialidad</label>
                  <input
                    type="text"
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Matrícula</label>
                  <input
                    type="text"
                    name="matricula"
                    value={form.matricula}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CUIT</label>
                  <input
                    type="text"
                    name="cuit"
                    value={form.cuit}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Dirección
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provincia</label>
                  <input
                    type="text"
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código Postal</label>
                  <input
                    type="text"
                    name="codigoPostal"
                    value={form.codigoPostal}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
