import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { registerPatient } from '../services/auth';
import { useUser } from '../context/UserContext';

const PatientRegister = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para DNI
    if (name === 'dni') {
      const numericValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
      
      if (errors.dni) {
        setErrors(prev => ({ ...prev, dni: '' }));
      }
    } else if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
      
      if (errors.telefono) {
        setErrors(prev => ({ ...prev, telefono: '' }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (form.dni.length < 7) {
      newErrors.dni = 'El DNI debe tener al menos 7 dígitos';
    }

    if (form.telefono.length < 10) {
      newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }

    if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!form.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Registrar en el backend PostgreSQL
      const response = await registerPatient(form.dni, form.password);
      
      if (response && response.paciente) {
        const userData = {
          id: response.paciente.id,
          nombre: form.nombre,
          dni: form.dni,
          email: form.email,
          telefono: form.telefono,
          fechaNacimiento: form.fechaNacimiento,
          isPatient: true,
          debeCambiarClave: response.paciente.debe_cambiar_clave
        };
        
        login(userData);
        
        setStep(2);
        setTimeout(() => {
          navigate('/patient-dashboard', {
            state: {
              mostrarCompletarPerfil: true,
              mensaje: '¡Registro exitoso! Por favor, completa tus datos.',
              forzarCambioClave: response.paciente.debe_cambiar_clave
            }
          });
        }, 3000);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      alert('Error en el registro. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta de paciente ha sido creada. En unos segundos serás redirigido al dashboard.
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 w-full transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">
            Registro de Paciente
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Creá tu cuenta de paciente en TurnosAR y accedé a todas las clínicas asociadas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Formulario */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">Datos Personales</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <User className="w-4 h-4 inline mr-2" />
                  DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                    errors.dni ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="12345678"
                  maxLength="8"
                  required
                />
                {errors.dni && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.dni}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  placeholder="juan@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="11 1234 5678"
                  required
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.telefono}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                    errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  required
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.fechaNacimiento}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="Mínimo 8 caracteres"
                  minLength="8"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta de paciente'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tenés cuenta?{' '}
                <button 
                  onClick={() => navigate('/patient-login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          </div>

          {/* Beneficios */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Beneficios de registrarte</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Acceso a todas las clínicas asociadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Reserva de turnos 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Historial médico completo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Notificaciones de turnos</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Acceso a estudios médicos</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">¿Por qué TurnosAR?</h3>
              <p className="text-gray-700 mb-4">
                Somos la plataforma líder en gestión de turnos médicos en Argentina, 
                conectando pacientes con las mejores clínicas y profesionales de la salud.
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

export default PatientRegister;
