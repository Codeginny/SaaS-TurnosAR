import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Shield, Lock, Eye, EyeOff, Save, Edit, Key, User, Mail, Bell, Phone } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';

const AccountData = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
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
    try {
      // Validar contraseñas
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      // Validar teléfono si se ingresó
      if (form.telefono) {
        const phoneValidation = validateArgentinePhone(form.telefono);
        if (!phoneValidation.isValid) {
          setErrors(prev => ({ ...prev, telefono: phoneValidation.message }));
          return;
        }
      }
      
      // Limpiar teléfono para guardar
      const formToSave = {
        ...form,
        telefono: form.telefono ? cleanPhoneForStorage(form.telefono) : ''
      };
      
      // Aquí iría la lógica para guardar en MockAPI
      console.log('Guardando datos de cuenta:', formToSave);
      setIsEditing(false);
      // Mostrar toast de éxito
    } catch (error) {
      console.error('Error al guardar:', error);
      // Mostrar toast de error
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: user?.twoFactorEnabled || false,
      emailNotifications: user?.emailNotifications || true,
      smsNotifications: user?.smsNotifications || false,
      sessionTimeout: user?.sessionTimeout || 30
    });
    setIsEditing(false);
  };

  return (
    <div className="p-8 w-full bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">Datos de tu Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestioná tu información de login y configuración de seguridad</p>
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
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
            {/* Información de login */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información de Login
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
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
              </div>
            </div>

            {/* Cambio de contraseña */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Cambio de Contraseña
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña actual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Configuración de Seguridad
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Autenticación de dos factores</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Añade una capa extra de seguridad a tu cuenta</p>
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
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Tiempo de sesión</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tiempo de inactividad antes de cerrar sesión</p>
                  </div>
                  <select
                    name="sessionTimeout"
                    value={form.sessionTimeout}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Configuración de Notificaciones
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Notificaciones por email</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Recibe alertas importantes por correo electrónico</p>
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
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Notificaciones por SMS</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Recibe alertas importantes por mensaje de texto</p>
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
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
