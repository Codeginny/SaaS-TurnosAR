import React, { useState } from 'react';
import { User, MapPin, Heart, AlertTriangle, Calendar, Save } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import DataCleanerService from '../services/dataCleanerService';

const MedicalProfileForm = ({ pacienteId, onComplete, onCancel }) => {
  const [form, setForm] = useState({
    obraSocial: '',
    direccion: '',
    provincia: '',
    localidad: '',
    codigoPostal: '',
    grupoSangre: '',
    enfermedades: '',
    alergias: '',
    emergenciaContacto: '',
    emergenciaTelefono: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Solo validar campos que el usuario haya llenado
    if (form.obraSocial && form.obraSocial.trim().length < 2) {
      newErrors.obraSocial = 'El nombre de la obra social debe tener al menos 2 caracteres';
    }
    
    if (form.direccion && form.direccion.trim().length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }
    
    if (form.codigoPostal && !/^\d{4,5}$/.test(form.codigoPostal)) {
      newErrors.codigoPostal = 'El código postal debe tener 4 o 5 dígitos';
    }
    
    if (form.emergenciaTelefono && form.emergenciaTelefono.length < 10) {
      newErrors.emergenciaTelefono = 'El teléfono de emergencia debe tener al menos 10 dígitos';
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
      // Preparar datos médicos
      const datosMedicos = {
        ...form,
        fechaActualizacion: new Date().toISOString()
      };
      
      // Limpiar datos antes de enviar
      const datosLimpios = DataCleanerService.cleanObject(datosMedicos, {
        removeEmptyKeys: true,
        convertEmptyStrings: true,
        trimStrings: true
      });
      
      // Actualizar paciente en la API
      await axiosInstance.put(`/pacientes/${pacienteId}`, datosLimpios);
      
      // Notificar completado
      onComplete();
      
    } catch (error) {
      console.error('Error al guardar perfil médico:', error);
      alert('Error al guardar el perfil médico. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const gruposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4">
            Completa tu Perfil Médico
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Esta información nos ayudará a brindarte una mejor atención médica
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de Contacto de Emergencia */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Contacto de Emergencia
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Nombre del contacto
                </label>
                <input
                  type="text"
                  name="emergenciaContacto"
                  value={form.emergenciaContacto}
                  onChange={handleChange}
                  className="w-full border border-red-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-300 focus:border-red-500"
                  placeholder="Nombre y apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Teléfono de emergencia
                </label>
                <input
                  type="tel"
                  name="emergenciaTelefono"
                  value={form.emergenciaTelefono}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-300 focus:border-red-500 ${
                    errors.emergenciaTelefono ? 'border-red-500' : 'border-red-300'
                  }`}
                  placeholder="11 1234 5678"
                />
                {errors.emergenciaTelefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergenciaTelefono}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Información Médica
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Grupo sanguíneo
                </label>
                <select
                  name="grupoSangre"
                  value={form.grupoSangre}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                >
                  <option value="">Selecciona tu grupo</option>
                  {gruposSangre.map(grupo => (
                    <option key={grupo} value={grupo}>{grupo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Obra social
                </label>
                <input
                  type="text"
                  name="obraSocial"
                  value={form.obraSocial}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    errors.obraSocial ? 'border-red-500' : 'border-blue-300'
                  }`}
                  placeholder="Nombre de tu obra social"
                />
                {errors.obraSocial && (
                  <p className="mt-1 text-sm text-red-600">{errors.obraSocial}</p>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Enfermedades crónicas
                </label>
                <textarea
                  name="enfermedades"
                  value={form.enfermedades}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="Lista las enfermedades crónicas que padeces (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Alergias
                </label>
                <textarea
                  name="alergias"
                  value={form.alergias}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="Lista las alergias que padeces (opcional)"
                />
              </div>
            </div>
          </div>

          {/* Información de Dirección */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Dirección
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  name="provincia"
                  value={form.provincia}
                  onChange={handleChange}
                  className="w-full border border-green-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-300 focus:border-green-500"
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Localidad
                </label>
                <input
                  type="text"
                  name="localidad"
                  value={form.localidad}
                  onChange={handleChange}
                  className="w-full border border-green-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-300 focus:border-green-500"
                  placeholder="Localidad"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-300 focus:border-green-500 ${
                    errors.direccion ? 'border-red-500' : 'border-green-300'
                  }`}
                  placeholder="Calle y número"
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={form.codigoPostal}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-300 focus:border-green-500 ${
                    errors.codigoPostal ? 'border-red-500' : 'border-green-300'
                  }`}
                  placeholder="1234"
                  maxLength="5"
                />
                {errors.codigoPostal && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Completar después
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalProfileForm;
