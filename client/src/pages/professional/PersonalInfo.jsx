import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User, MapPin, Phone, Mail, Calendar, FileText, Save, Edit, Lock, Eye, EyeOff } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';
import { changeProfessionalPassword } from '../../services/auth';

const PersonalInfo = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
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

  const [errors, setErrors] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

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
      
      // Aquí iría la lógica para guardar en la base de datos
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await changeProfessionalPassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      
      // Limpiar el formulario
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Limpiar errores
      setPasswordErrors({});
      
      // Mostrar mensaje de éxito
      alert('Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      // Limpiar errores previos
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Mostrar error específico basado en la respuesta del servidor
      if (error.response?.status === 401) {
        setPasswordErrors({
          currentPassword: 'La contraseña actual es incorrecta',
          newPassword: '',
          confirmPassword: ''
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Datos inválidos';
        if (errorMessage.includes('6 caracteres')) {
          setPasswordErrors({
            currentPassword: '',
            newPassword: 'La contraseña debe tener al menos 6 caracteres',
            confirmPassword: ''
          });
        } else {
          setPasswordErrors({
            currentPassword: '',
            newPassword: '',
            confirmPassword: errorMessage
          });
        }
      } else if (error.response?.status === 404) {
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: 'Usuario no encontrado'
        });
      } else {
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: 'Error al cambiar contraseña. Intenta nuevamente.'
        });
      }
    }
  };

  return (
    <div className="p-8 w-full bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">Información Personal</h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Gestioná tus datos personales y profesionales</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
          {/* Botones de acción */}
          <div className="flex justify-end mb-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            )}
          </div>

          <form className="space-y-6">
            {/* Sección de Cambio de Contraseña */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 transition-colors duration-300 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                🔐 Cambiar Contraseña
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.currentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      name="currentPassword"
                      className={`w-full border rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                        passwordErrors.currentPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPasswords.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.newPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      name="newPassword"
                      className={`w-full border rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                        passwordErrors.newPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      name="confirmPassword"
                      className={`w-full border rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                        passwordErrors.confirmPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Repite tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 flex items-center"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </button>
              </div>
            </div>

            {/* Información básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información Básica
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información de Contacto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="54XXXXXXXXXX (12 dígitos)"
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300 ${
                      errors.telefono ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.telefono}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Formato: 54 + 10 dígitos (ej: 543834788937)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Información profesional */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información Profesional
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Especialidad</label>
                  <input
                    type="text"
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Matrícula</label>
                  <input
                    type="text"
                    name="matricula"
                    value={form.matricula}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">CUIT</label>
                  <input
                    type="text"
                    name="cuit"
                    value={form.cuit}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Dirección
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Provincia</label>
                  <input
                    type="text"
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Código Postal</label>
                  <input
                    type="text"
                    name="codigoPostal"
                    value={form.codigoPostal}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
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
