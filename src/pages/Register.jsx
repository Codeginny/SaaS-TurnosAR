import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CheckCircle, Lock, CreditCard } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import { validateArgentinePhone, cleanPhoneForStorage } from '../utils/validations';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [form, setForm] = useState({
    dni: '',
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
    
    // Validación especial para DNI
    if (name === 'dni') {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
      
      // Limpiar error del campo
      if (errors.dni) {
        setErrors(prev => ({ ...prev, dni: '' }));
      }
    }
    // Validación especial para teléfono
    else if (name === 'telefono') {
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
    
    // Validar DNI antes de enviar
    if (form.dni.length < 7 || form.dni.length > 8) {
      setErrors(prev => ({ ...prev, dni: 'El DNI debe tener entre 7 y 8 dígitos' }));
      return;
    }
    
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
        dni: parseInt(form.dni),
        telefono: cleanPhoneForStorage(form.telefono)
      };
      
      // Guardar en MockAPI /profesionales
      const response = await axiosInstance.post('/profesionales', formToSend);
      
      // Validar que la respuesta tenga los datos necesarios
      if (response.data && response.data.id) {
        const userData = {
          id: response.data.id,
          dni: parseInt(form.dni),
          nombre: form.nombre,
          email: form.email,
          telefono: cleanPhoneForStorage(form.telefono),
          especialidad: form.especialidad,
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white w-full">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
            Registro Profesional
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unite a TurnosAR y comenzá a gestionar tu consultorio de manera profesional y eficiente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Soy Profesional</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  DNI Profesional
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
                  pattern="[0-9]{7,8}"
                  title="Ingresa tu DNI (7 u 8 dígitos)"
                  required
                />
                {errors.dni && (
                  <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Ingresa tu DNI sin puntos ni espacios (7 u 8 dígitos)
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
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="Dr. Juan Pérez"
                  required
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
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="dr.juan@consultorio.com"
                  required
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
                  value={form.telefono}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="54XXXXXXXXXX (12 dígitos)"
                  required
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Para contactarte en caso de dudas o problemas técnicos
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Formato: 54 + 10 dígitos (ej: 543834788937)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Especialidad
                </label>
                <select
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  required
                >
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="Mínimo 8 caracteres"
                  minLength="8"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-yellow-700 mb-4">¿Por qué pedimos tu información?</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Necesitamos tu email y teléfono para poder comunicarnos contigo y asesorarte en caso de que tengas dudas sobre cómo usar el sistema.
              </p>
              <div className="text-sm text-gray-600 space-y-2">
                <p>📧 <strong>Email:</strong> Para enviarte notificaciones importantes y novedades del sistema</p>
                <p>📱 <strong>Teléfono:</strong> Para contactarte en caso de problemas técnicos o dudas</p>
                <p>👨‍⚕️ <strong>DNI:</strong> Como identificador único para tu cuenta profesional</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;



