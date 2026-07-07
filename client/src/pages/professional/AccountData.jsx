import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { Shield, Lock, Eye, EyeOff, Save, Edit, Key, User, Mail, Bell, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';

const AccountData = () => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    username: user?.username || user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false,
    emailNotifications: user?.emailNotifications || true,
    smsNotifications: user?.smsNotifications || false,
    sessionTimeout: user?.sessionTimeout || 30
  });

  const [errors, setErrors] = useState({});

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setForm({
        username: user?.username || user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: user?.twoFactorEnabled || false,
        emailNotifications: user?.emailNotifications || true,
        smsNotifications: user?.smsNotifications || false,
        sessionTimeout: user?.sessionTimeout || 30
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validación especial para teléfono
    if (name === 'telefono') {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
      
      // Limpiar error del campo
      if (errors.telefono) {
        setErrors(prev => ({ ...prev, telefono: '' }));
      }
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      // Validar campos requeridos
      if (!form.username.trim()) {
        setErrors(prev => ({ ...prev, username: 'El nombre de usuario es requerido' }));
        setLoading(false);
        return;
      }

      if (!form.email.trim()) {
        setErrors(prev => ({ ...prev, email: 'El email es requerido' }));
        setLoading(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setErrors(prev => ({ ...prev, email: 'El formato del email no es válido' }));
        setLoading(false);
        return;
      }

      // Validar teléfono si se ingresó
      if (form.telefono) {
        const phoneValidation = validateArgentinePhone(form.telefono);
        if (!phoneValidation.isValid) {
          setErrors(prev => ({ ...prev, telefono: phoneValidation.message }));
          setLoading(false);
          return;
        }
      }

      // Validar contraseñas si se están cambiando
      if (form.newPassword || form.confirmPassword) {
        if (!form.currentPassword) {
          setErrors(prev => ({ ...prev, currentPassword: 'Debes ingresar tu contraseña actual' }));
          setLoading(false);
          return;
        }

        if (form.newPassword.length < 6) {
          setErrors(prev => ({ ...prev, newPassword: 'La nueva contraseña debe tener al menos 6 caracteres' }));
          setLoading(false);
          return;
        }

        if (form.newPassword !== form.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
          setLoading(false);
          return;
        }
      }

      // Preparar datos para guardar
      const formToSave = {
        ...form,
        telefono: form.telefono ? cleanPhoneForStorage(form.telefono) : '',
        // Limpiar contraseñas del objeto que se guarda
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

      // Simular guardado (aquí iría la llamada real a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar el contexto de usuario
      if (updateUser) {
        updateUser({
          ...user,
          username: formToSave.username,
          nombre: formToSave.username,
          email: formToSave.email,
          telefono: formToSave.telefono,
          twoFactorEnabled: formToSave.twoFactorEnabled,
          emailNotifications: formToSave.emailNotifications,
          smsNotifications: formToSave.smsNotifications,
          sessionTimeout: formToSave.sessionTimeout
        });
      }

      // Limpiar formulario de contraseñas
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setIsEditing(false);
      setMessage({ type: 'success', text: 'Datos guardados exitosamente' });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage({ type: 'error', text: 'Error al guardar los datos. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: user?.twoFactorEnabled || false,
      emailNotifications: user?.emailNotifications || true,
      smsNotifications: user?.smsNotifications || false,
      sessionTimeout: user?.sessionTimeout || 30
    });
    setErrors({});
    setMessage({ type: '', text: '' });
    setIsEditing(false);
  };

  return (
    <div className="p-8 w-full bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">Datos de tu Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Gestioná tu información de login y configuración de seguridad</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
          {/* Mensaje de éxito/error */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

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
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <form className="space-y-6">
            {/* Información de login */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información de Login
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Nombre de usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300 ${
                      errors.username ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300 ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.email}</p>
                  )}
                </div>
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
                      errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.telefono}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Formato: 54 + 10 dígitos (ej: 543834788937)
                  </p>
                </div>
              </div>
            </div>

            {/* Cambio de contraseña */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Cambio de Contraseña
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Contraseña actual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full border rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300 ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.currentPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full border rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Confirmar nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full border rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Configuración de Seguridad
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg transition-colors duration-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Autenticación de dos factores</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="twoFactorEnabled"
                      checked={form.twoFactorEnabled}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg transition-colors duration-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Tiempo de sesión</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Tiempo de inactividad antes de cerrar sesión</p>
                  </div>
                  <select
                    name="sessionTimeout"
                    value={form.sessionTimeout}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-slate-600 transition-colors duration-300"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Configuración de Notificaciones
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg transition-colors duration-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Notificaciones por email</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Recibe alertas importantes por correo electrónico</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={form.emailNotifications}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg transition-colors duration-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Notificaciones por SMS</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Recibe alertas importantes por mensaje de texto</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={form.smsNotifications}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountData;
