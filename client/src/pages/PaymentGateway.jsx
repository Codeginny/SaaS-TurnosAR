import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Shield, CheckCircle, X } from 'lucide-react';
import './PaymentGateway.css';

const PaymentGateway = ({ planData, onClose }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardName: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setPaymentSuccess(true);
      setTimeout(() => {
        onClose(); // Cerrar modal
        navigate('/dashboard');
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Tu suscripción a {planData.name} ha sido activada correctamente.
          </p>
          <div className="text-sm text-gray-500">
            Redirigiendo al dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Pasarela de Pago
          </h1>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Indicador de Demo */}
          <div className="text-center mb-6">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-xl inline-block mb-4">
              <span className="text-sm font-medium">DEMO - Solo para Pruebas</span>
            </div>
            <p className="text-gray-600">
              Esta es una simulación de pasarela de pago. No se procesarán pagos reales.
            </p>
          </div>

          {/* Resumen del Plan */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen de Compra</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold text-blue-600">{planData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Precio:</span>
              <span className="font-bold text-2xl text-green-600">{planData.price}</span>
            </div>
          </div>

          {/* Formulario de Pago */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Información de Facturación */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Información de Facturación
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Calle, número, departamento"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Buenos Aires"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provincia
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="CABA"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="1234"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Pago */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Información de Pago
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarjetas Aceptadas
                      </label>
                      <div className="flex gap-2">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                        <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                        <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre en la Tarjeta
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mes
                        </label>
                        <input
                          type="text"
                          name="expMonth"
                          value={formData.expMonth}
                          onChange={handleChange}
                          placeholder="12"
                          maxLength="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año
                        </label>
                        <input
                          type="text"
                          name="expYear"
                          value={formData.expYear}
                          onChange={handleChange}
                          placeholder="2025"
                          maxLength="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Pago */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando Pago...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Completar Compra - {planData.price}
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  🔒 Tus datos están protegidos con encriptación SSL de 256 bits
                </p>
              </div>
            </form>
          </div>

          {/* Información de Seguridad */}
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ IMPORTANTE:</strong> Esta es una demostración técnica. 
                No se procesarán pagos reales ni se almacenarán datos de tarjetas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
