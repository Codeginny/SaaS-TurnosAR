import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => (
  <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
    <div className="w-full px-8 lg:px-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">Contacto</h1>
        <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-500 mb-4 transition-colors duration-300">
          Contáctenos y comience a gestionar su consultorio online
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
          Para consultas comerciales, dudas o inquietudes sobre nuestro sistema o si desea conocer más del proyecto, estamos para ayudarlo.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Información de contacto */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">Información de contacto</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg transition-colors duration-300">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Email</h4>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">soporte@turnosar.com</p>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">comercial@turnosar.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg transition-colors duration-300">
                  <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Teléfono</h4>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">+54 11 1234-5678</p>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Lun a Vie 9:00 - 18:00</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Oficina</h4>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Av. Corrientes 1234</p>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">CABA, Buenos Aires, Argentina</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg transition-colors duration-300">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Horarios de atención</h4>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Lunes a Viernes: 9:00 - 18:00</p>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Sábados: 9:00 - 13:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-slate-800 rounded-xl p-6 transition-colors duration-300">
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 transition-colors duration-300">¿Por qué elegirnos?</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="flex items-center gap-2">
                <span className="text-green-500 dark:text-green-400 transition-colors duration-300">✓</span>
                Respuesta en menos de 24 horas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 dark:text-green-400 transition-colors duration-300">✓</span>
                Soporte técnico especializado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 dark:text-green-400 transition-colors duration-300">✓</span>
                Implementación personalizada
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 dark:text-green-400 transition-colors duration-300">✓</span>
                Capacitación incluida
              </li>
            </ul>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
          <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">Envíanos tu consulta</h3>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Nombre completo *</label>
                <input 
                  type="text" 
                  placeholder="Su nombre" 
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Email *</label>
                <input 
                  type="email" 
                  placeholder="ejemplo@email.com" 
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300" 
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Teléfono</label>
                <input 
                  type="tel" 
                  placeholder="+54 11 1234-5678" 
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Tipo de consulta *</label>
                <select className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300">
                  <option value="">Seleccione una opción</option>
                  <option value="comercial">Consulta comercial</option>
                  <option value="tecnica">Soporte técnico</option>
                  <option value="demo">Solicitar demo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Mensaje *</label>
              <textarea 
                placeholder="Cuéntenos sobre cómo podemos ayudarle..." 
                className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 resize-none" 
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Enviar consulta
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default Contact;



