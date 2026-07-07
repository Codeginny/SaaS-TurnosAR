import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import { loginProfessional } from '../services/auth';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Buscar el profesional en la base de datos
      // 🔑 PASO CLAVE: Enviar al servidor backend que manejará la validación con Bcrypt
      const response = await loginProfessional(formData.email, formData.password);
      
      if (!response || !response.profesional) {
        setError('Error en la respuesta del servidor');
        setLoading(false);
        return;
      }

      const profesional = response.profesional;

      // Login exitoso
      const userData = {
        id: profesional.id,
        nombre: profesional.nombre,
        email: profesional.email,
        telefono: profesional.telefono,
        especialidad: profesional.especialidad,
        isProfessional: true
      };

      // Guardar token JWT en localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      login(userData);
      navigate('/dashboard');

    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al conectar con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 w-full transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">
            Iniciar Sesión
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Accedé a tu panel profesional de TurnosAR
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Formulario */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">Soy Profesional</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email profesional
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  placeholder="dr.juan@consultorio.com"
                  required
                />
              </div>

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
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
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
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-sm transition-colors duration-300">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tenés cuenta?{' '}
                <button 
                  onClick={() => navigate('/registro')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Registrate aquí
                </button>
              </p>
            </div>
          </div>

          {/* Información y Accesos Rápidos */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Accesos Rápidos</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/patient-login')}
                  className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5 text-blue-600" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



