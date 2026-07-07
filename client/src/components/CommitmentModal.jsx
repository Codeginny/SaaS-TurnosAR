import { Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Modal de Compromiso de Asistencia para pacientes con Obra Social
 * Muestra información sobre la seña de $10.000 y condiciones de reintegro
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar y proceder al pago
 * @param {number} props.senaAmount - Monto de la seña (default: 10000)
 */
const CommitmentModal = ({ isOpen, onClose, onConfirm, senaAmount = 10000 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🛡️ Compromiso de Asistencia
            </h2>
          </div>

          {/* Pregunta principal */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
            <p className="text-amber-800 dark:text-amber-200 font-medium text-center">
              ¿Por qué cobramos una seña de ${senaAmount.toLocaleString()}?
            </p>
          </div>

          {/* Explicación */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Para garantizar que nuestros especialistas estén disponibles para quienes realmente lo necesitan, 
            solicitamos una <strong>Seña de Compromiso</strong> a los pacientes con Obra Social.
          </p>

          {/* Condiciones */}
          <div className="space-y-4 mb-6">
            {/* Asistencia */}
            <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Si asistís a tu turno:
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  El monto se te reintegrará automáticamente a tu cuenta de Mercado Pago 
                  en el momento en que el recepcionista valide tu Token de Obra Social.
                </p>
              </div>
            </div>

            {/* Cancelación */}
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Si cancelás con 24hs de antelación:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  El reintegro también es automático.
                </p>
              </div>
            </div>

            {/* No asistencia */}
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Si no asistís sin aviso:
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  La seña se utilizará para cubrir los gastos operativos del consultorio.
                </p>
              </div>
            </div>
          </div>

          {/* Nota sobre tiempo de reintegro */}
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              ⏱️ <strong>Importante:</strong> El reintegro se procesa al instante, pero puede demorar 
              entre 2 y 10 días hábiles en verse reflejado en tu resumen bancario según tu entidad.
            </p>
          </div>

          {/* Agradecimiento */}
          <p className="text-center text-gray-700 dark:text-gray-300 font-medium mb-6">
            ¡Gracias por ayudarnos a cuidar el tiempo de todos! 🙏
          </p>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Aceptar y Pagar Seña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentModal;
