import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { CreditCard, Plus, Edit, Trash2, Copy, Save, X, CheckCircle } from 'lucide-react';
import { validateArgentinePhone, cleanPhoneForStorage } from '../../utils/validations';

const Banks = () => {
  const { user } = useUser();
  const [banks, setBanks] = useState([
    {
      id: 1,
      banco: 'Banco Santander',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: '123456789',
      cbu: '0720123456789012345678',
      alias: 'TURNOSAR.MEDICO',
      titular: 'Dr. Virginia Alejandra Ponce',
      cuit: '27-12345678-9',
      estado: 'Activo',
      esPrincipal: true
    },
    {
      id: 2,
      banco: 'Banco Galicia',
      tipoCuenta: 'Caja de Ahorro',
      numeroCuenta: '987654321',
      cbu: '0070123456789012345678',
      alias: 'VIRGINIA.PONCE',
      titular: 'Dr. Virginia Alejandra Ponce',
      cuit: '27-12345678-9',
      estado: 'Activo',
      esPrincipal: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    cbu: '',
    alias: '',
    titular: '',
    cuit: ''
  });

  const [errors, setErrors] = useState({});

  const bancos = [
    'Banco Santander',
    'Banco Galicia',
    'Banco Nación',
    'Banco Provincia',
    'Banco Ciudad',
    'Banco Macro',
    'Banco HSBC',
    'Banco Itaú',
    'Banco Supervielle',
    'Banco Credicoop'
  ];

  const tiposCuenta = [
    'Cuenta Corriente',
    'Caja de Ahorro',
    'Cuenta Especial'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Editar banco existente
      setBanks(prev => prev.map(bank => 
        bank.id === editingId 
          ? { ...bank, ...form, id: editingId }
          : bank
      ));
      setEditingId(null);
    } else {
      // Agregar nuevo banco
      const newBank = {
        ...form,
        id: Date.now(),
        estado: 'Activo',
        esPrincipal: banks.length === 0 // El primero será principal
      };
      setBanks(prev => [...prev, newBank]);
    }
    
    setForm({
      banco: '',
      tipoCuenta: '',
      numeroCuenta: '',
      cbu: '',
      alias: '',
      titular: '',
      cuit: ''
    });
    setErrors({});
    setShowAddForm(false);
  };

  const handleEdit = (bank) => {
    setForm({
      banco: bank.banco,
      tipoCuenta: bank.tipoCuenta,
      numeroCuenta: bank.numeroCuenta,
      cbu: bank.cbu,
      alias: bank.alias,
      titular: bank.titular,
      cuit: bank.cuit
    });
    setEditingId(bank.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta bancaria?')) {
      setBanks(prev => prev.filter(bank => bank.id !== id));
    }
  };

  const handleCancel = () => {
    setForm({
      banco: '',
      tipoCuenta: '',
      numeroCuenta: '',
      cbu: '',
      alias: '',
      titular: '',
      cuit: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const setAsPrimary = (id) => {
    setBanks(prev => prev.map(bank => ({
      ...bank,
      esPrincipal: bank.id === id
    })));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías mostrar un toast de confirmación
  };

  return (
    <div className="p-8 w-full bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">Bancos</h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Gestioná tus cuentas bancarias para recibir pagos de pacientes</p>
        </div>

        {/* Botón agregar */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
          >
            <Plus className="w-4 h-4" />
            Agregar Cuenta Bancaria
          </button>
        </div>

        {/* Formulario de agregar/editar */}
        {showAddForm && (
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                {editingId ? 'Editar Cuenta Bancaria' : 'Agregar Nueva Cuenta Bancaria'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Banco</label>
                  <select
                    name="banco"
                    value={form.banco}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  >
                    <option value="">Seleccionar banco</option>
                    {bancos.map(banco => (
                      <option key={banco} value={banco}>{banco}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Tipo de Cuenta</label>
                  <select
                    name="tipoCuenta"
                    value={form.tipoCuenta}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposCuenta.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Número de Cuenta</label>
                  <input
                    type="text"
                    name="numeroCuenta"
                    value={form.numeroCuenta}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">CBU</label>
                  <input
                    type="text"
                    name="cbu"
                    value={form.cbu}
                    onChange={handleChange}
                    required
                    placeholder="22 dígitos"
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Alias</label>
                  <input
                    type="text"
                    name="alias"
                    value={form.alias}
                    onChange={handleChange}
                    required
                    placeholder="ej: TURNOSAR.MEDICO"
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Titular</label>
                  <input
                    type="text"
                    name="titular"
                    value={form.titular}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">CUIT</label>
                  <input
                    type="text"
                    name="cuit"
                    value={form.cuit}
                    onChange={handleChange}
                    required
                    placeholder="XX-XXXXXXXX-X"
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de bancos */}
        <div className="grid md:grid-cols-2 gap-6">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{bank.banco}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{bank.tipoCuenta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bank.esPrincipal && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full transition-colors duration-300">
                      <CheckCircle className="w-3 h-3" />
                      Principal
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(bank)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 rounded transition-colors duration-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 rounded transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información de la cuenta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Número de cuenta:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{bank.numeroCuenta}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">CBU:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-900 dark:text-white transition-colors duration-300">{bank.cbu}</span>
                    <button
                      onClick={() => copyToClipboard(bank.cbu)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 rounded transition-colors duration-300"
                      title="Copiar CBU"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Alias:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{bank.alias}</span>
                    <button
                      onClick={() => copyToClipboard(bank.alias)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 rounded transition-colors duration-300"
                      title="Copiar Alias"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Titular:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{bank.titular}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">CUIT:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{bank.cuit}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
                {!bank.esPrincipal && (
                  <button
                    onClick={() => setAsPrimary(bank.id)}
                    className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300 text-sm font-medium"
                  >
                    Establecer como Principal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay bancos */}
        {banks.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No hay cuentas bancarias</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">Agregá tu primera cuenta bancaria para recibir pagos de pacientes</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
            >
              Agregar Cuenta Bancaria
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banks;
