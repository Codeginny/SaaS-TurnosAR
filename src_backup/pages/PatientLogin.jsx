import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Smartphone, Globe } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import SecurityService from '../services/securityService';
import DataCleanerService from '../services/dataCleanerService';
import { 
  validarFormatoDNI, 
  validarContraseña, 
  dniYaRegistrado
} from '../utils/pacientes.js';

const PatientLogin = () => {
  const navigate = useNavigate();
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      // 2️⃣ INTENTAR LOGIN
      const response = await axiosInstance.post('/api/patient-login', {
        dni: formData.dni,
        password: formData.password
      });
      
      const { paciente, token } = response.data;
      setPaciente(paciente);
      
      // Guardar token en localStorage (si tu auth flow lo requiere, asumo que sí porque interceptor lo usa)
      if (token) localStorage.setItem('token', token);
      const tieneDatosCompletos = paciente.nombre && 
                                  paciente.nombre.trim() && 
                                  paciente.email && 
                                  paciente.email.trim() && 
                                  paciente.telefono && 
                                  paciente.telefono.trim();

      const userData = {
        id: paciente.id,
        nombre: paciente.nombre || '',
        dni: paciente.dni,
        email: paciente.email || '',
        telefono: paciente.telefono || '',
        fechaNacimiento: paciente.fechaNacimiento || '',
        isPatient: true,
        debe_cambiar_clave: paciente.debe_cambiar_clave,
        datosCompletados: tieneDatosCompletos
      };

      login(userData);
      
      // Si tiene datos completos, mostrar mensaje de bienvenida
      if (tieneDatosCompletos) {
        navigate('/patient-dashboard', { 
          state: { 
            mensaje: `¡Bienvenido de vuelta ${paciente.nombre}! Tus datos están completos.`
          }
        });
      } else {
        // Si no tiene datos completos, redirigir para completar perfil
        navigate('/patient-dashboard', { 
          state: { 
            mostrarCompletarPerfil: true,
            mensaje: 'Bienvenido de vuelta. Por favor completa tus datos personales.'
          }
        });
      }

    } catch (error) {
      console.error('Error en login:', error);
      
      // Si el error es 401 y dice que no existe el paciente, Hacemos AUTO-REGISTRO
      if (error.response && error.response.status === 401 && error.response.data.error === 'No existe un paciente con ese DNI') {
        try {
          if (formData.password !== formData.dni) {
            setError('Para tu primera vez, la contraseña debe ser igual a tu DNI');
            setLoading(false);
            return;
          }

          const registroResponse = await axiosInstance.post('/api/patient-register', {
            dni: formData.dni,
            password: formData.password
          });
          
          const { paciente: nuevoPaciente, token } = registroResponse.data;
          setPaciente(nuevoPaciente);
          if (token) localStorage.setItem('token', token);
          
          const userData = {
            id: nuevoPaciente.id,
            dni: nuevoPaciente.dni,
            isPatient: true,
            datosCompletados: false,
            debe_cambiar_clave: true
          };

          login(userData);
          addRegistroNotification('Usuario');
          
          navigate('/patient-dashboard', { 
            state: { 
              mostrarCompletarPerfil: true,
              mensaje: '¡Registro exitoso! Tu cuenta se creó automáticamente. Por favor completa tus datos personales para continuar.'
            }
          });
          return;
          
        } catch (registroError) {
          console.error('Error en auto-registro:', registroError);
          setError(registroError.response?.data?.error || 'Error al crear la cuenta. Intenta nuevamente.');
          setLoading(false);
          return;
        }
      } else if (error.response && error.response.status === 401) {
        setError('Contraseña incorrecta. Si es tu primera vez, usa tu DNI como contraseña.');
      } else {
        setError('Error al conectar con el servidor. Intenta nuevamente.');
      }
    } finally {
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

    // Validar que la contraseña actual sea correcta
    if (formData.password !== paciente.password && formData.password !== paciente.dni.toString()) {
      setError('La contraseña actual es incorrecta');
      return;
    }

    try {
      // IMPORTANTE: Hashear la nueva contraseña antes de enviarla
      const hashedNewPassword = await SecurityService.hashPassword(newPassword);
      
      // Actualizar la contraseña en la base de datos
      await axiosInstance.put(`/api/patient-change-password/${paciente.id}`, {
        ...paciente,
        password: hashedNewPassword
      });

      // Actualizar el estado local
      setFormData(prev => ({ ...prev, password: newPassword }));
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      
      // Mostrar modal de éxito
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError('Error al cambiar la contraseña. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4 w-full">
        <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
            Soy Paciente
          </h1>
          
          {/* Opciones de acceso */}
          <div className="flex gap-4 justify-center mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="w-4 h-4" />
              Mis Turnos Móvil
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              Turnero Web
            </div>
          </div>
          
          <p className="text-gray-600">
            Si sos paciente registrado en alguna de las clínicas asociadas, ingresa tu DNI para iniciar sesión.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                N° Documento (DNI)
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                  formData.dni && !validarFormatoDNI(formData.dni).valido 
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="12345678"
                maxLength="8"
                pattern="[0-9]{8}"
                required
              />
              {formData.dni && !validarFormatoDNI(formData.dni).valido && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ {validarFormatoDNI(formData.dni).error}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    formData.password && !validarContraseña(formData.password).valido 
                      ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && !validarContraseña(formData.password).valido && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ {validarContraseña(formData.password).error}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                💡 <strong>Primera vez:</strong> Ingresa tu DNI como contraseña (ej: 12345678)
                <br />
                🔐 <strong>Ya registrado:</strong> Usa tu contraseña personalizada
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            {/* Botón para cambiar contraseña (solo si el paciente existe) */}
            {paciente && (
              <button 
                type="button"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="block w-full text-green-600 hover:text-green-700 font-medium text-sm"
              >
                🔐 Cambiar contraseña
              </button>
            )}
          </div>

          {/* Formulario para cambiar contraseña */}
          {showChangePassword && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">🔐 Cambiar Contraseña</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:border-green-500 ${
                      newPassword && !validarContraseña(newPassword).valido 
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                        : 'border-green-300'
                    }`}
                  />
                  {newPassword && !validarContraseña(newPassword).valido && (
                    <p className="mt-1 text-xs text-red-600">
                      ⚠️ {validarContraseña(newPassword).error}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:border-green-500 ${
                      confirmPassword && newPassword !== confirmPassword 
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-500' 
                        : 'border-green-300'
                    }`}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      ⚠️ Las contraseñas no coinciden
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && newPassword && (
                    <p className="mt-1 text-xs text-green-600">
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

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all animate-scaleIn">
            <div className="text-center">
              {/* Icono de éxito */}
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
                ¡Contraseña Cambiada!
              </h3>
              
              {/* Mensaje */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
              
              {/* Botón de cerrar */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLogin;
