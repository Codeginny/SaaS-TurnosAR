import React, { useState } from 'react';
import { X, Download, Printer, Share2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * @typedef {Object} ComprobanteAFIP
 * @property {string} tipo - Tipo de comprobante: FACTURA_C, NOTA_CREDITO_C
 * @property {string} concepto - Concepto del servicio
 * @property {string} cae - Código de Autorización Electrónico
 * @property {string} caeVencimiento - Fecha de vencimiento del CAE
 * @property {number} puntoVenta - Punto de venta
 * @property {number} numeroComprobante - Número de comprobante
 * @property {number} montoGravado - Monto neto gravado
 * @property {number} montoIva - Monto de IVA
 * @property {number} montoTotal - Monto total
 * @property {string} [observacion] - Observaciones adicionales
 */

/**
 * @typedef {Object} Emisor
 * @property {string} nombre - Nombre del emisor (profesional)
 * @property {string} cuit - CUIT del emisor
 * @property {string} [condicionIva] - Condición frente a IVA
 */

/**
 * @typedef {Object} Receptor
 * @property {string} nombre - Nombre del receptor (paciente)
 * @property {string} [email] - Email del receptor
 * @property {string} [telefono] - Teléfono del receptor
 * @property {string} [condicionIva] - Condición frente a IVA
 */

/**
 * @typedef {Object} TurnoFacturado
 * @property {string} fecha - Fecha del turno
 * @property {string} hora - Hora del turno
 * @property {string} especialidad - Especialidad médica
 * @property {string} clinica - Nombre de la clínica
 */

/**
 * @typedef {Object} FacturaPreviewProps
 * @property {ComprobanteAFIP} comprobante - Datos del comprobante AFIP
 * @property {Emisor} emisor - Datos del emisor
 * @property {Receptor} receptor - Datos del receptor
 * @property {TurnoFacturado} turno - Datos del turno facturado
 * @property {Function} onClose - Callback para cerrar el modal
 */

/**
 * Componente modal de previsualización de comprobante fiscal.
 * Muestra factura electrónica con formato AFIP/ARCA y acciones de descarga, impresión y envío.
 *
 * Características:
 * - Visualización completa de comprobante fiscal
 * - Datos de emisor, receptor y servicio
 * - CAE, vencimiento y validación
 * - Acciones: descargar PDF, imprimir, compartir por WhatsApp
 * - QR y código de barras simulados
 * - Soporte para Factura C y Nota de Crédito C
 *
 * @param {FacturaPreviewProps} props - Props del componente
 * @returns {JSX.Element} Modal de previsualización de factura
 */
const FacturaPreview = ({ comprobante, emisor, receptor, turno, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Simula la descarga del PDF del comprobante.
   * En producción generaría PDF real desde backend.
   *
   * @returns {void}
   */
  const handleDownload = () => {
    setLoading(true);
    // Simular descarga del PDF
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Factura descargada exitosamente');
    }, 1500);
  };

  /**
   * Abre diálogo de impresión del navegador.
   * Permite imprimir o guardar como PDF nativo.
   *
   * @returns {void}
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Simula el envío del comprobante por WhatsApp.
   * En producción usaría API de WhatsApp Business.
   *
   * @returns {void}
   */
  const handleShare = () => {
    // Simular envío por WhatsApp
    setSuccessMessage('Factura enviada por WhatsApp al paciente');
  };

  if (!comprobante) {
    return null;
  }

  /**
   * Formatea fecha a formato español (DD/MM/YYYY).
 *
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada en español
 */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Formatea monto a moneda argentina (ARS).
 *
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado con símbolo de peso
 */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="factura-print-area bg-white rounded-lg shadow-2xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-none print:w-full print:max-w-none relative">
      {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex items-center justify-between print:bg-none print:text-black print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">ARCA</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">Comprobante Electrónico</h2>
              <p className="text-sm text-blue-100">Facturación Electrónica AFIP-Ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido de la Factura */}
        <div className="p-6 space-y-6">
          {/* Estado del Comprobante */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            comprobante.tipo === 'FACTURA_C' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {comprobante.tipo === 'FACTURA_C' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {comprobante.tipo === 'FACTURA_C' ? 'Factura C' : 'Nota de Crédito C'}
              </p>
              <p className="text-sm text-gray-600">{comprobante.concepto || 'Servicios Médicos'}</p>
            </div>
          </div>

          {/* Datos del Emisor */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">EMISOR</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{emisor?.nombre || 'Profesional'}</p>
              <p className="text-sm text-gray-600">CUIT: {emisor?.cuit || '20123456789'}</p>
              <p className="text-sm text-gray-600">Condición IVA: Monotributista</p>
            </div>
          </div>

          {/* Datos del Receptor */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">RECEPTOR</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{receptor?.nombre || turno?.pacienteNombre || 'Paciente'}</p>
              <p className="text-sm text-gray-600">DNI: {receptor?.dni || turno?.pacienteDni || '-'}</p>
              <p className="text-sm text-gray-600">Email: {receptor?.email || '-'}</p>
              <p className="text-sm text-gray-600">Teléfono: {receptor?.telefono || '-'}</p>
              <p className="text-sm text-gray-600">Condición IVA: Consumidor Final</p>
            </div>
          </div>

          {/* Datos del Comprobante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">NÚMERO</h3>
              <p className="font-mono font-medium text-gray-900">
                {(comprobante.puntoVenta || 1).toString().padStart(4, '0')}-{(comprobante.numeroComprobante || Math.floor(Math.random() * 100000000)).toString().padStart(8, '0')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">FECHA</h3>
              <p className="font-medium text-gray-900">{formatDate(new Date())}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">CAE</h3>
              <p className="font-mono font-medium text-gray-900">{comprobante.cae}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">VENCIMIENTO CAE</h3>
              <p className="font-medium text-gray-900">{formatDate(comprobante.caeVencimiento)}</p>
            </div>
          </div>

          {/* Detalles del Servicio */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">DETALLE DEL SERVICIO</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Descripción</span>
                <span className="font-medium text-gray-900">{comprobante.concepto || 'Servicios Médicos'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha del Turno</span>
                <span className="font-medium text-gray-900">{formatDate(turno?.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hora</span>
                <span className="font-medium text-gray-900">{turno?.hora}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Especialidad</span>
                <span className="font-medium text-gray-900">{turno?.especialidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clínica</span>
                <span className="font-medium text-gray-900">{turno?.clinica}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {comprobante.observacion && (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">OBSERVACIONES</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                {comprobante.observacion}
              </p>
            </div>
          )}

          {/* Totales */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            {comprobante.montoGravado > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Neto Gravado</span>
                <span className="font-medium text-gray-900">{formatCurrency(comprobante.montoGravado)}</span>
              </div>
            )}
            {comprobante.montoIva > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (21%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(comprobante.montoIva)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2">
              <span className="text-gray-900">TOTAL</span>
              <span className="text-blue-600">{formatCurrency(comprobante.montoTotal || comprobante.monto || 0)}</span>
            </div>
          </div>

          {/* QR y Código de Barras (Simulado) */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                <div className="text-xs text-gray-400 text-center">
                  QR<br/>AFIP
                </div>
              </div>
              <p className="text-xs text-gray-500">Escanear para validar</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-48 bg-gray-100 rounded flex items-center justify-center mb-2">
                <div className="text-xs text-gray-400">||||||||||||||||||||||||</div>
              </div>
              <p className="text-xs text-gray-500">Código de Barras</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 print:hidden">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Descargando...' : 'Descargar PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">
            Comprobante generado electrónicamente. Autorizado por AFIP/ARCA.
            <br />
            Este documento es válido como comprobante fiscal.
          </p>
        </div>

        {/* Success Modal Overlay */}
        {successMessage && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl print:hidden">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center border border-gray-100 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Operación Exitosa!</h3>
              <p className="text-gray-500 mb-8">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage('')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default FacturaPreview;
