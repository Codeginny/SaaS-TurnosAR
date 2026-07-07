import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, Mail, Building2, Users, Shield, CheckCircle, Phone, CreditCard } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import SecurityService from '../services/securityService';
import DataCleanerService from '../services/dataCleanerService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para el formulario completo de profesional
  const [showFullForm, setShowFullForm] = useState(false);
  const [fullFormData, setFullFormData] = useState({
    dni: '',
    nombre: '',
    email: '',
    telefono: '',
    especialidad: 'Medicina General',
    password: ''
  });
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [profesional, setProfesional] = useState(null);

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
    'Odontología'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFullFormChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para DNI
    if (name === 'dni') {
      const numericValue = value.replace(/\D/g, '');
      setFullFormData(prev => ({ ...prev, [name]: numericValue }));
    }
    // Validación especial para teléfono
    else if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '');
      setFullFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFullFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Buscar el profesional en la base de datos
      const response = await axiosInstance.get('/profesionales');
      const profesionales = response.data;
      
      // Buscar el profesional por DNI (convertir a número para comparar)
      const dniNumero = parseInt(formData.dni);
      const profesionalEncontrado = profesionales.find(p => p.dni === dniNumero);
      
      if (!profesionalEncontrado) {
        // Si no existe, mostrar formulario completo para registro
        // IMPORTANTE: El DNI del formulario simple se usa para crear la cuenta
        setShowFullForm(true);
        setFullFormData(prev => ({ 
          ...prev, 
          dni: formData.dni,
          // La contraseña inicial será el DNI para primera vez
          password: formData.dni
        }));
        setLoading(false);
        return;
      }

      // Guardar el profesional encontrado
      setProfesional(profesionalEncontrado);

      // Verificar si es la primera vez (la contraseña es igual al DNI)
      if (SecurityService.isTemporaryPassword(formData.password, formData.dni.toString())) {
        setIsFirstTime(true);
        setShowFullForm(true);
        setFullFormData(prev => ({ 
          ...prev, 
          dni: formData.dni,
          nombre: profesionalEncontrado.nombre || '',
          email: profesionalEncontrado.email || '',
          telefono: profesionalEncontrado.telefono || '',
          especialidad: profesionalEncontrado.especialidad || 'Medicina General'
        }));
        setLoading(false);
        return;
      }

      // Validar contraseña personalizada usando bcrypt
      const isPasswordValid = await SecurityService.verifyPassword(formData.password, profesionalEncontrado.password);
      if (!isPasswordValid) {
        setError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      // Login exitoso - profesional con contraseña personalizada
      const userData = {
        id: profesionalEncontrado.id,
        nombre: profesionalEncontrado.nombre,
        dni: profesionalEncontrado.dni,
        email: profesionalEncontrado.email,
        telefono: profesionalEncontrado.telefono,
        especialidad: profesionalEncontrado.especialidad,
        isProfessional: true
      };

      login(userData);
      navigate('/dashboard');

    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al conectar con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFullFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validar DNI antes de enviar
    if (fullFormData.dni.length < 7 || fullFormData.dni.length > 8) {
      setError('El DNI debe tener entre 7 y 8 dígitos');
      return;
    }
    
    // IMPORTANTE: Verificar que el DNI del formulario completo coincida con el del formulario simple
    if (!isFirstTime && fullFormData.dni !== formData.dni) {
      setError('El DNI debe coincidir con el ingresado anteriormente');
      return;
    }
    
    // Validar que todos los campos estén completos
    if (!fullFormData.nombre || !fullFormData.email || !fullFormData.telefono) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Validar teléfono (formato argentino)
    if (fullFormData.telefono.length < 12 || fullFormData.telefono.length > 13) {
      setError('El teléfono debe tener el formato 54XXXXXXXXXX (12-13 dígitos)');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isFirstTime) {
        // Es la primera vez, actualizar contraseña
        // IMPORTANTE: Hashear la nueva contraseña antes de enviarla
        const hashedPassword = await SecurityService.hashPassword(fullFormData.password);
        
        await axiosInstance.put(`/profesionales/${profesional.id}`, {
          ...profesional,
          password: hashedPassword
        });
        
        // Login exitoso después de cambiar contraseña
        const userData = {
          id: profesional.id,
          nombre: profesional.nombre,
          dni: profesional.dni,
          email: profesional.email,
          telefono: profesional.telefono,
          especialidad: profesional.especialidad,
          isProfessional: true
        };

        login(userData);
        navigate('/dashboard');
      } else {
        // Es un nuevo profesional, crear cuenta
        // IMPORTANTE: Hashear la contraseña antes de enviarla
        const hashedPassword = await SecurityService.hashPassword(fullFormData.password);
        
        // Preparar datos limpios para la API
        const datosLimpios = DataCleanerService.cleanProfesionalData({
          ...fullFormData,
          dni: parseInt(fullFormData.dni),
          password: hashedPassword // La contraseña hasheada
        });
        
        const response = await axiosInstance.post('/profesionales', datosLimpios);
        
        if (response.data && response.data.id) {
          const userData = {
            id: response.data.id,
            dni: parseInt(fullFormData.dni),
            nombre: fullFormData.nombre,
            email: fullFormData.email,
            telefono: fullFormData.telefono,
            especialidad: fullFormData.especialidad,
            isProfessional: true
          };
          
          login(userData);
          navigate('/dashboard');
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      }
      
    } catch (error) {
      console.error('Error en registro/actualización:', error);
      setError('Error al procesar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientLogin = () => {
    navigate('/patient-login');
  };

  const handleBackToSimpleForm = () => {
    setShowFullForm(false);
    setIsFirstTime(false);
    setProfesional(null);
    setFullFormData({
      dni: '',
      nombre: '',
      email: '',
      telefono: '',
      especialidad: 'Medicina General',
      password: ''
    });
    setError('');
  };

  // Si se debe mostrar el formulario completo
  if (showFullForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white w-full">
        <div className="max-w-4xl mx-auto py-16 px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
              {isFirstTime ? 'Cambio de Contraseña Obligatorio' : 'Registro de Profesional'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isFirstTime 
                ? 'Por seguridad, debes cambiar tu contraseña antes de acceder al sistema'
                : 'Completa tus datos para crear tu cuenta profesional'
              }
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-700">
                  {isFirstTime ? '🔐 Cambiar Contraseña' : '👨‍⚕️ Datos del Profesional'}
                </h2>
                <button
                  onClick={handleBackToSimpleForm}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Volver
                </button>
              </div>
              
              <form onSubmit={handleFullFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    DNI Profesional
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={fullFormData.dni}
                    onChange={handleFullFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="12345678"
                    pattern="[0-9]{7,8}"
                    title="Ingresa tu DNI (7 u 8 dígitos)"
                    required
                    readOnly={isFirstTime}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ingresa tu DNI sin puntos ni espacios (7 u 8 dígitos)
                    {!isFirstTime && (
                      <span className="text-blue-600 font-medium">
                        {' '}⚠️ Este DNI no se puede cambiar, debe coincidir con el ingresado anteriormente
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={fullFormData.nombre}
                    onChange={handleFullFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="Dr. Juan Pérez"
                    required
                    readOnly={isFirstTime}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email profesional
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={fullFormData.email}
                    onChange={handleFullFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="dr.juan@consultorio.com"
                    required
                    readOnly={isFirstTime}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Para comunicarnos y asesorarte en el uso del sistema
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={fullFormData.telefono}
                    onChange={handleFullFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="54XXXXXXXXXX (12-13 dígitos)"
                    required
                    readOnly={isFirstTime}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Para contactarte en caso de dudas o problemas técnicos
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Especialidad
                  </label>
                  <select
                    name="especialidad"
                    value={fullFormData.especialidad}
                    onChange={handleFullFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    required
                    disabled={isFirstTime}
                  >
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    {isFirstTime ? 'Nueva Contraseña' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={fullFormData.password}
                    onChange={handleFullFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder={isFirstTime ? "Mínimo 6 caracteres" : "Mínimo 6 caracteres"}
                    minLength="6"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {isFirstTime 
                      ? 'La nueva contraseña debe tener al menos 6 caracteres'
                      : 'La contraseña debe tener al menos 6 caracteres'
                    }
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isFirstTime ? 'Cambiando contraseña...' : 'Creando cuenta...'}
                    </>
                  ) : (
                    <>
                      {isFirstTime ? <Shield className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      {isFirstTime ? 'Cambiar Contraseña y Continuar' : 'Crear Cuenta Profesional'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white w-full">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
            TurnosAR
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema unificado de gestión de turnos médicos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Acceso Profesional</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  DNI Profesional
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="12345678"
                  pattern="[0-9]{7,8}"
                  title="Ingresa tu DNI (7 u 8 dígitos)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ingresa tu DNI sin puntos ni espacios
                </p>
              </div>

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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="Tu contraseña o DNI (primera vez)"
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
                <p className="mt-1 text-xs text-gray-500">
                  Si es tu primera vez, usa tu DNI como contraseña
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Acceder como Profesional
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tenés cuenta? El sistema te guiará automáticamente
              </p>
            </div>
          </div>

          {/* Información y Accesos Rápidos */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Accesos Rápidos</h3>
              <div className="space-y-3">
                <button 
                  onClick={handlePatientLogin}
                  className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Acceso para Pacientes</span>
                </button>
                <button 
                  onClick={() => navigate('/precios')}
                  className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <span className="w-5 h-5 text-blue-600 text-lg">💰</span>
                  <span className="text-gray-700">Ver Planes y Precios</span>
                </button>
                <button 
                  onClick={() => navigate('/contacto')}
                  className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <span className="w-5 h-5 text-blue-600 text-lg">📞</span>
                  <span className="text-gray-700">Contactar Soporte</span>
                </button>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">¿Por qué TurnosAR?</h3>
              <p className="text-gray-700 mb-4">
                Somos la plataforma líder en gestión de turnos médicos en Argentina, 
                diseñada para optimizar la gestión de tu consultorio.
              </p>
              <div className="text-sm text-gray-600">
                <p>🏥 +100 clínicas asociadas</p>
                <p>👨‍⚕️ +5,000 profesionales</p>
                <p>📱 App móvil disponible</p>
                <p>🔒 Datos 100% seguros</p>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-yellow-700 mb-4">🔒 Seguridad Garantizada</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Al registrarte por primera vez, tu contraseña será tu DNI. Por seguridad, 
                el sistema te obligará a cambiarla antes de acceder al panel profesional.
              </p>
              <div className="text-sm text-gray-600 space-y-2">
                <p>🛡️ <strong>Primera vez:</strong> DNI como contraseña</p>
                <p>🔐 <strong>Seguridad:</strong> Cambio obligatorio de contraseña</p>
                <p>👨‍⚕️ <strong>Acceso:</strong> Solo después de cambiar contraseña</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



