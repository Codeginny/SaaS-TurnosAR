import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { MapPin, Plus, Edit, Trash2, Save, X, Clock, Phone, Mail, Navigation } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';

const Addresses = () => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      nombre: 'Consultorio San Martín',
      direccion: 'San Martín 1234',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: '1001',
      telefono: '+54 11 1234-5678',
      email: 'sanmartin@consultorio.com',
      horarios: 'Lunes a Viernes 9:00 - 18:00',
      esPrincipal: true,
      coordenadas: { lat: -34.6037, lng: -58.3816 }
    },
    {
      id: 2,
      nombre: 'Centro Médico Palermo',
      direccion: 'Av. Santa Fe 5678',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: '1414',
      telefono: '+54 11 2345-6789',
      email: 'palermo@consultorio.com',
      horarios: 'Lunes a Sábados 8:00 - 20:00',
      esPrincipal: false,
      coordenadas: { lat: -34.5736, lng: -58.4224 }
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    telefono: '',
    email: '',
    horarios: ''
  });

  const [errors, setErrors] = useState({});

  const provincias = [
    'Buenos Aires',
    'Ciudad Autónoma de Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar teléfono antes de guardar
    const phoneValidation = validateArgentinePhone(form.telefono);
    if (!phoneValidation.isValid) {
      setErrors(prev => ({ ...prev, telefono: phoneValidation.message }));
      return;
    }
    
    // Limpiar teléfono para guardar
    const formToSave = {
      ...form,
      telefono: cleanPhoneForStorage(form.telefono)
    };
    
    if (editingId) {
      // Editar dirección existente
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId 
          ? { ...addr, ...formToSave, id: editingId }
          : addr
      ));
      setEditingId(null);
    } else {
      // Agregar nueva dirección
      const newAddress = {
        ...formToSave,
        id: Date.now(),
        esPrincipal: addresses.length === 0, // La primera será principal
        coordenadas: { lat: 0, lng: 0 } // Coordenadas por defecto
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    
    setForm({
      nombre: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      telefono: '',
      email: '',
      horarios: ''
    });
    setErrors({});
    setShowAddForm(false);
  };

  const handleEdit = (address) => {
    setForm({
      nombre: address.nombre,
      direccion: address.direccion,
      ciudad: address.ciudad,
      provincia: address.provincia,
      codigoPostal: address.codigoPostal,
      telefono: address.telefono,
      email: address.email,
      horarios: address.horarios
    });
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const handleCancel = () => {
    setForm({
      nombre: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      telefono: '',
      email: '',
      horarios: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const setAsPrimary = (id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      esPrincipal: addr.id === id
    })));
  };

  const openInMaps = (coordenadas) => {
    const url = `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`;
    window.location.href = url;
  };

  return (
    <div className="p-8 w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Direcciones</h1>
          <p className="text-gray-600">Gestioná los lugares donde atendés a tus pacientes</p>
        </div>

        {/* Botón agregar */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Dirección
          </button>
        </div>

        {/* Formulario de agregar/editar */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del lugar</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="ej: Consultorio San Martín"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                    placeholder="ej: San Martín 1234"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                  <select
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  >
                    <option value="">Seleccionar provincia</option>
                    {provincias.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                  <input
                    type="text"
                    name="codigoPostal"
                    value={form.codigoPostal}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    placeholder="54XXXXXXXXXX (12 dígitos)"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                      errors.telefono ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Formato: 54 + 10 dígitos (ej: 543834788937)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="consultorio@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horarios de atención</label>
                  <input
                    type="text"
                    name="horarios"
                    value={form.horarios}
                    onChange={handleChange}
                    required
                    placeholder="ej: Lunes a Viernes 9:00 - 18:00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de direcciones */}
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-2xl shadow-lg p-6">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{address.nombre}</h3>
                    <p className="text-sm text-gray-600">{address.ciudad}, {address.provincia}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {address.esPrincipal && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Principal
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-1 text-blue-600 hover:text-blue-900 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-1 text-red-600 hover:text-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información de la dirección */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{address.direccion}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{address.telefono}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{address.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{address.horarios}</span>
                </div>

                <div className="text-sm text-gray-600">
                  CP: {address.codigoPostal}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex gap-2">
                {!address.esPrincipal && (
                  <button
                    onClick={() => setAsPrimary(address.id)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Establecer como Principal
                  </button>
                )}
                <button
                  onClick={() => openInMaps(address.coordenadas)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Ver en Maps
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay direcciones */}
        {addresses.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay direcciones</h3>
            <p className="text-gray-600 mb-4">Agregá tu primera dirección de consultorio</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Dirección
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
