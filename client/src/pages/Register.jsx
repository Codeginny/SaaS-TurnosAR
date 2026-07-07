import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CheckCircle, Lock } from 'lucide-react';
import { registerProfessional } from '../services/auth';
import { useUser } from '../context/UserContext';
import { validateArgentinePhone, cleanPhoneForStorage } from '../utils/validations';
import { hashPassword, validatePasswordStrength } from '../utils/security.js';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: 'Medicina General',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar teléfono antes de enviar
    const phoneValidation = validateArgentinePhone(form.telefono);
    if (!phoneValidation.isValid) {
      setErrors(prev => ({ ...prev, telefono: phoneValidation.message }));
      return;
    }
    
    setLoading(true);
    
    try {
      // Limpiar teléfono para guardar
      const formToSend = {
        ...form,
        telefono: cleanPhoneForStorage(form.telefono)
        // La contraseña se envía en texto plano al backend, que la hasheará con Bcrypt
      };
      
      // 🔑 PASO CLAVE: Enviar al servidor backend que manejará el hashing con Bcrypt
      const response = await registerProfessional(formToSend);
      
      // Validar que la respuesta tenga los datos necesarios
      if (response && response.profesional) {
        const userData = {
          id: response.profesional.id,
          nombre: response.profesional.nombre,
          email: response.profesional.email,
          telefono: response.profesional.telefono,
          especialidad: response.profesional.especialidad,
          isProfessional: true
        };
        
        // Guardar en localStorage
        login(userData);
        
        setStep(2);
        setTimeout(() => {
          navigate('/dashboard');
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
            Tu cuenta profesional ha sido creada. En unos segundos serás redirigido al dashboard.
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
            Registro Profesional
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Unite a TurnosAR y comenzá a gestionar tu consultorio de manera profesional y eficiente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Formulario */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">Soy Profesional</h2>
            
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
                  placeholder="Dr. Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email profesional
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  placeholder="dr.juan@consultorio.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono
                </label>
                <PhoneInput
                  country={'ar'}
                  value={form.telefono}
                  onChange={(phone) => setForm(prev => ({ ...prev, telefono: phone }))}
                  inputClass={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  containerClass="w-full"
                  buttonClass="bg-white dark:bg-slate-700"
                  dropdownClass="bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  searchClass="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="543834788937"
                  required
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{errors.telefono}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Formato: +54 + 10 dígitos (ej: 543834788937)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Especialidad
                </label>
                <select
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  required
                >
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
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
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Mínimo 8 caracteres"
                  minLength="8"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta profesional'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tenés cuenta?{' '}
                <button 
                  onClick={() => navigate('/login')}
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
                  <span>Gestión completa de turnos médicos</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Panel de control profesional</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Estadísticas y métricas en tiempo real</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gestión de pacientes y agenda</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>15 días de prueba gratuita</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Prueba gratuita</h3>
              <p className="text-blue-100 mb-4">
                Comenzá a usar TurnosAR sin compromiso durante 15 días
              </p>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-blue-100 text-sm">por 15 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;



