import { useState } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';

/**
 * Modal de pago con tarjeta de crédito/débito.
 * Simula proceso de pago con validaciones de formulario.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar el pago
 * @param {number} props.amount - Monto a pagar
 * @param {string} props.currency - Moneda (default: 'ARS')
 */
const PaymentModal = ({ isOpen, onClose, onConfirm, amount, currency = 'ARS' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    cardNumber: '',
    expiration: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre completo
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar número de tarjeta (13-19 dígitos)
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '').replace(/-/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'El número de tarjeta es obligatorio';
    } else if (!/^\d{13,19}$/.test(cardNumberClean)) {
      newErrors.cardNumber = 'Número de tarjeta inválido (13-19 dígitos)';
    }

    // Validar expiración (MM/AA)
    if (!formData.expiration) {
      newErrors.expiration = 'La fecha de expiración es obligatoria';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiration)) {
      newErrors.expiration = 'Formato inválido (ej: 12/25)';
    } else {
      const [month, year] = formData.expiration.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiration = 'La tarjeta ha expirado';
      }
    }

    // Validar CVV (3-4 dígitos)
    if (!formData.cvv) {
      newErrors.cvv = 'El CVV es obligatorio';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV inválido (3-4 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');
    setFormData({ ...formData, cardNumber: value });
  };

  const handleExpirationChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/');
    if (value.length <= 5) {
      setFormData({ ...formData, expiration: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Pago con Tarjeta
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <strong>⚠️ Esto es un ejemplo:</strong> No se procesará ningún pago real. Los datos de la tarjeta no se almacenarán.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario de pago */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre completo (como aparece en la tarjeta)*
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                    setFormData({ ...formData, fullName: value });
                  }}
                  className={`w-full rounded-lg border p-2.5 text-sm dark:bg-gray-700 dark:text-white ${
                    errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Juan Pérez"
                  required
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de tarjeta*
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  className={`w-full rounded-lg border p-2.5 text-sm dark:bg-gray-700 dark:text-white ${
                    errors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  maxLength={19}
                  required
                />
                {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vencimiento (MM/AA)*
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      id="expiration"
                      value={formData.expiration}
                      onChange={handleExpirationChange}
                      className={`w-full rounded-lg border p-2.5 pl-10 text-sm dark:bg-gray-700 dark:text-white ${
                        errors.expiration ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="12/25"
                      maxLength={5}
                      required
                    />
                  </div>
                  {errors.expiration && <p className="mt-1 text-sm text-red-600">{errors.expiration}</p>}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV*
                  </label>
                  <input
                    type="password"
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    className={`w-full rounded-lg border p-2.5 text-sm dark:bg-gray-700 dark:text-white ${
                      errors.cvv ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="•••"
                    maxLength={4}
                    required
                  />
                  {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pagar ${amount.toLocaleString()} {currency}
                  </>
                )}
              </button>
            </form>

            {/* Resumen del pago */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Resumen del pago</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Turno médico</span>
                  <span className="text-gray-900 dark:text-white">${amount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tarifa de servicio</span>
                  <span className="text-gray-900 dark:text-white">$0.00 {currency}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${amount.toLocaleString()} {currency}</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">Aceptamos:</div>
                <div className="flex gap-2">
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Visa</div>
                  <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Mastercard</div>
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Amex</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
