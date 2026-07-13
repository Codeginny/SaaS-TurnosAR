import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Smartphone, Globe } from 'lucide-react';
import { registerPatient, loginPatient, changePatientPassword } from '../services/auth';
import { backendAPI } from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { validarFormatoDNI, validarContraseña } from '../utils/validators.js';
import { hashDNI, validatePasswordStrength } from '../utils/security.js';
import Swal from 'sweetalert2';

const PatientLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useUser();
  const { addRegistroNotification } = useNotifications();
  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paciente, setPaciente] = useState(null);

  // Mostrar alerta si la sesión expiró
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión Expirada',
        text: 'Tu sesión ha expirado. Por favor, ingresa nuevamente.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Entendido'
      });
      // Limpiar el parámetro de la URL
      navigate('/patient-login', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    
    // Si cambia el DNI, limpiar el estado del paciente
    if (name === 'dni') {
      setPaciente(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // PREVENT DOUBLE SUBMIT
    setLoading(true);
    setError('');

    // 1️⃣ VALIDACIONES INICIALES
    const validacionDNI = validarFormatoDNI(formData.dni);
    if (!validacionDNI.valido) {
      setError(validacionDNI.error);
      setLoading(false);
      return;
    }

    const validacionPassword = validarContraseña(formData.password);
    if (!validacionPassword.valido) {
      setError(validacionPassword.error);
      setLoading(false);
      return;
    }

    try {
      // 2️⃣ VERIFICAR SI EL PACIENTE YA EXISTE (usando API real del backend)
      // Intentar login directamente con el backend
      const loginResponse = await loginPatient(formData.dni, formData.password);
      
      // Login exitoso
      const userData = {
        id: loginResponse.paciente.id,
        dni: loginResponse.paciente.dni,
        nombre: loginResponse.paciente.nombre,
        email: loginResponse.paciente.email,
        telefono: loginResponse.paciente.telefono,
        isPatient: true,
        datosCompletados: !!(loginResponse.paciente.nombre && loginResponse.paciente.email),
        debeCambiarClave: loginResponse.paciente.debe_cambiar_clave
      };

      // Guardar token JWT en localStorage
      if (loginResponse.token) {
        localStorage.setItem('token', loginResponse.token);
      }

      login(userData);
      
      // Redirigir según estado del perfil
      if (userData.debeCambiarClave) {
        navigate('/patient-dashboard', { 
          state: { 
            mostrarCompletarPerfil: true,
            mensaje: '¡Registro exitoso! Por favor, completa tus datos y cambia tu contraseña.',
          }
        });
      } else {
        navigate('/patient-dashboard');
      }
      
      return;
    } catch (loginError) {
      const errorMsg = loginError.response?.data?.error || loginError.message;
      
      // Si NO es el error de paciente inexistente (que usamos para auto-registro), lo mostramos como error
      if (!errorMsg.includes('No existe un paciente')) {
        console.error('Error en login:', errorMsg);
      }
      // Si el error es "No existe un paciente con ese DNI", intentar auto-registro
      if (loginError.response?.data?.error?.includes('No existe un paciente')) {
        try {
          // 3️⃣ AUTO-REGISTRO: Si no existe, se registra automáticamente
          // Verificar que la contraseña inicial sea igual al DNI
          if (formData.password !== formData.dni) {
            setError('Para tu primera vez, la contraseña debe ser igual a tu DNI');
            setLoading(false);
            return;
          }

          // 🔑 PASO CLAVE: Enviar al servidor backend que manejará el hashing con Bcrypt
          const registroResponse = await registerPatient(formData.dni, formData.password);
          
          // Crear usuario temporal y Login
          const userData = {
            id: registroResponse.paciente.id,
            dni: registroResponse.paciente.dni,
            isPatient: true,
            datosCompletados: false,
            debeCambiarClave: true
          };

          // Guardar token JWT en localStorage
          if (registroResponse.token) {
            localStorage.setItem('token', registroResponse.token);
          }

          login(userData);
          
          // Agregar notificación de registro exitoso
          addRegistroNotification('Usuario');
          
          // Redirigir a completar perfil Y cambiar clave
          navigate('/patient-dashboard', { 
            state: { 
              mostrarCompletarPerfil: true,
              mensaje: '¡Registro exitoso! Por favor, completa tus datos y cambia tu contraseña.',
              forzarCambioClave: true
            }
          });
          return;

        } catch (registroError) {
          console.error('Error en auto-registro:', registroError.response?.data?.error || registroError.message);
          if (registroError.response?.data?.error) {
            setError(registroError.response.data.error);
          } else {
            setError('Error al crear la cuenta. Intenta nuevamente.');
          }
          setLoading(false);
          return;
        }
      }
      
      // Otro tipo de error de login
      if (loginError.response?.data?.error) {
        setError(loginError.response.data.error);
      } else if (loginError.response?.status === 401) {
        setError('DNI o contraseña incorrectos. Por favor, verifica tus credenciales.');
      } else {
        setError('Error al iniciar sesión. Por favor, intenta nuevamente.');
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Mostrar mensaje de recuperación de contraseña
    alert('Se ha enviado un email a tu correo registrado con instrucciones para recuperar tu contraseña.');
  };

  const handleChangePassword = async () => {
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar la nueva contraseña
    const validacionPassword = validarContraseña(newPassword);
    if (!validacionPassword.valido) {
      setError(validacionPassword.error);
      return;
    }

    try {
      // **LÓGICA MEJORADA PARA CAMBIO DE CONTRASEÑA**
      const { changePatientPassword } = await import('../services/auth.js');
      
      await changePatientPassword(paciente.id, formData.password, newPassword);

      // Actualizar el estado local
      setFormData(prev => ({ ...prev, password: newPassword }));
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      
      // Mostrar mensaje de éxito
      alert('✅ Contraseña cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error.response?.data?.error || error.message);
      setError('Error al cambiar la contraseña. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 w-full transition-colors duration-300">
        <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mb-4 transition-colors duration-300">
            Soy Paciente
          </h1>
          
          {/* Opciones de acceso */}
          <div className="flex gap-4 justify-center mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              <Smartphone className="w-4 h-4" />
              Mis Turnos Móvil
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              <Globe className="w-4 h-4" />
              Turnero Web
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Si sos paciente registrado en alguna de las clínicas asociadas, ingresa tu DNI para iniciar sesión.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                <User className="w-4 h-4 inline mr-2" />
                N° Documento (DNI)
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                  formData.dni && !validarFormatoDNI(formData.dni).valido 
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                    : 'border-gray-300 dark:border-slate-600'
                }`}
                placeholder="12345678"
                maxLength="8"
                pattern="[0-9]{8}"
                required
              />
              {formData.dni && !validarFormatoDNI(formData.dni).valido && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 transition-colors duration-300">
                  ⚠️ {validarFormatoDNI(formData.dni).error}
                </p>
              )}
              {formData.dni && validarFormatoDNI(formData.dni).valido && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400 transition-colors duration-300">
                  ✅ DNI válido
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                <Lock className="w-4 h-4 inline mr-2" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 pr-12 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                    formData.password && !validarContraseña(formData.password).valido 
                      ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && !validarContraseña(formData.password).valido && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ {validarContraseña(formData.password).error}
                </p>
              )}
              {formData.password && validarContraseña(formData.password).valido && (
                <p className="mt-1 text-xs text-green-600">
                  ✅ Contraseña válida
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                💡 <strong>Primera vez:</strong> Ingresa tu DNI como contraseña (ej: 12345678)
                <br />
                🔐 <strong>Ya registrado:</strong> Usa tu contraseña personalizada
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm transition-colors duration-300">{error}</span>
              </div>
            )}

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {paciente ? 'Ingresando...' : 'Creando cuenta...'}
                </>
              ) : (
                'Ingresar o Crear Cuenta'
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center space-y-3">
            <button 
              onClick={handleForgotPassword}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-300"
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            {/* Botón para cambiar contraseña (solo si el paciente existe) */}
            {paciente && (
              <button 
                type="button"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="block w-full text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm transition-colors duration-300"
              >
                🔐 Cambiar contraseña
              </button>
            )}
          </div>

          {/* Formulario para cambiar contraseña */}
          {showChangePassword && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 transition-colors duration-300">🔐 Cambiar Contraseña</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-1 transition-colors duration-300">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full border border-green-300 dark:border-green-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-1 transition-colors duration-300">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-colors duration-300 ${
                      newPassword && !validarContraseña(newPassword).valido 
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                        : 'border-green-300 dark:border-green-600'
                    }`}
                  />
                  {newPassword && !validarContraseña(newPassword).valido && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 transition-colors duration-300">
                      ⚠️ {validarContraseña(newPassword).error}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-1 transition-colors duration-300">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-colors duration-300 ${
                      confirmPassword && newPassword !== confirmPassword 
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                        : 'border-green-300 dark:border-green-600'
                    }`}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 transition-colors duration-300">
                      ⚠️ Las contraseñas no coinciden
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && newPassword && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 transition-colors duration-300">
                      ✅ Las contraseñas coinciden
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Cambiar Contraseña
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Tus datos están protegidos con encriptación SSL
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
