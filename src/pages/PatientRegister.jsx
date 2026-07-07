import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import SecurityService from '../services/securityService';
import DataCleanerService from '../services/dataCleanerService';

const PatientRegister = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    fechaNacimiento: ''
    // NOTA: Solo campos esenciales para el registro inicial
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

    // Validar nombre
    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (form.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar DNI
    if (!form.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (form.dni.length < 7) {
      newErrors.dni = 'El DNI debe tener al menos 7 dígitos';
    } else if (form.dni.length > 10) {
      newErrors.dni = 'El DNI no puede tener más de 10 dígitos';
    }

    // Validar email
    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar teléfono
    if (!form.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (form.telefono.length < 10) {
      newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }

    // Validar fecha de nacimiento
    if (!form.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const fecha = new Date(form.fechaNacimiento);
      const hoy = new Date();
      if (fecha > hoy) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
      }
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
      // Guardar en MockAPI /pacientes
      // IMPORTANTE: Hashear la contraseña inicial (DNI) antes de enviarla
      const hashedPassword = await SecurityService.hashPassword(form.dni);
      
      // Adaptar datos al nuevo esquema de MockAPI
      const datosAdaptados = {
        name: form.nombre,                    // name.fullName
        email: form.email,                    // internet.email
        phone: form.telefono,                 // phone.number
        password: hashedPassword,             // internet.password
        dni: form.dni,                        // Number (para identificación)
        fechaNacimiento: form.fechaNacimiento // Date
      };
      
      // Preparar datos limpios para la API
      const datosLimpios = DataCleanerService.cleanPacienteData(datosAdaptados);
      
      console.log('Datos originales del formulario:', form);
      console.log('Datos adaptados al esquema:', datosAdaptados);
      console.log('Datos finales limpios:', datosLimpios);
      console.log('DNI original:', form.dni);
      console.log('Password hasheado:', hashedPassword);
      
      // Intentar primero en /pacientes, si falla, usar /usuarios
      let response;
      try {
        response = await axiosInstance.post('/pacientes', datosLimpios);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Si /pacientes no existe, intentar en /usuarios
          response = await axiosInstance.post('/usuarios', datosLimpios);
        } else {
          throw error;
        }
      }
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data && response.data.id) {
        const userData = {
          id: response.data.id,
          nombre: form.nombre,
          dni: form.dni,
          email: form.email,
          telefono: form.telefono,
          fechaNacimiento: form.fechaNacimiento,
          isPatient: true
        };
        
        login(userData);
        
        setStep(2);
        setTimeout(() => {
          navigate('/patient-dashboard');
        }, 3000);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejo específico de errores
      if (error.response) {
        // Error de la API
        if (error.response.status === 409) {
          alert('Ya existe un usuario con ese DNI o email. Verifica tus datos.');
        } else if (error.response.status === 400) {
          alert('Datos inválidos. Verifica que todos los campos estén correctos.');
        } else {
          alert(`Error del servidor: ${error.response.status}. Intenta nuevamente.`);
        }
      } else if (error.request) {
        // Error de red
        alert('Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else {
        // Error general
        alert('Error en el registro. Intenta nuevamente.');
      }
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white w-full">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
            Registro de Paciente
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Creá tu cuenta de paciente en TurnosAR y accedé a todas las clínicas asociadas
          </p>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>🔐 Seguridad:</strong> Tu contraseña inicial será tu DNI. 
              Podrás cambiarla después de iniciar sesión por primera vez.
            </p>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Información:</strong> Solo se solicitan los datos esenciales para crear tu cuenta. 
              Los datos médicos se completarán cuando solicites tu primer turno.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Datos Personales</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Juan Pérez"
                  required
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.dni ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12345678"
                  maxLength="8"
                  required
                />
                {errors.dni && (
                  <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="juan@email.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="11 1234 5678"
                  required
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">🔐 Contraseña Inicial</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Tu contraseña inicial será tu <strong>DNI</strong> para mayor seguridad.
                    </p>
                    <p className="text-xs text-blue-600">
                      Podrás cambiarla después de iniciar sesión por primera vez.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
