import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Building2, Users, Calendar, Shield, CreditCard, Smartphone, Bell, FileText, MapPin } from 'lucide-react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('entidades');
  const [expandedFAQs, setExpandedFAQs] = useState({});

  const toggleFAQ = (index) => {
    setExpandedFAQs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const entidadesFAQs = [
    {
      q: '¿Cómo funciona TurnosAR para entidades médicas?',
      a: 'TurnosAR es una plataforma integral de gestión de turnos médicos diseñada específicamente para entidades de salud. El sistema se integra con su infraestructura existente a través de una interfaz web intuitiva y una API robusta.',
      icon: Building2
    },
    {
      q: '¿Qué planes y precios ofrecemos?',
      a: 'Ofrecemos tres planes principales: Estándar ($299/mes), Premium ($599/mes) y Platino ($999/mes). Cada plan incluye diferentes funcionalidades según las necesidades de su entidad.',
      icon: CreditCard
    }
  ];

  const pacientesFAQs = [
    {
      q: '¿Cómo puedo registrarme en TurnosAR?',
      a: 'El registro es simple y rápido. Solo necesita completar un formulario con sus datos personales básicos, verificar su email y confirmar su registro.',
      icon: Users
    },
    {
      q: '¿Cómo funciona el sistema de turnos?',
      a: 'Puede solicitar turnos seleccionando especialidad, provincia, entidad médica, fecha y horario disponible. El sistema confirma inmediatamente su cita.',
      icon: Calendar
    }
  ];

  const formatAnswer = (answer) => {
    return answer.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Encontrá respuestas a las consultas más comunes sobre TurnosAR.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveCategory('entidades')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeCategory === 'entidades'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Entidades y Profesionales
          </button>
          <button
            onClick={() => setActiveCategory('pacientes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeCategory === 'pacientes'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Pacientes
          </button>
        </div>

        {/* FAQ Content */}
        <div className="space-y-6">
          {activeCategory === 'entidades' ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                  Entidades y Profesionales
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Preguntas frecuentes para entidades médicas y profesionales de la salud
                </p>
              </div>
              {entidadesFAQs.map((faq, index) => {
                const IconComponent = faq.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2">{faq.q}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {expandedFAQs[index] ? 'Ocultar respuesta' : 'Ver respuesta completa'}
                          </span>
                          {expandedFAQs[index] ? (
                            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedFAQs[index] && (
                      <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="pt-4">
                          {formatAnswer(faq.a)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                  Pacientes
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Preguntas frecuentes para pacientes que utilizan TurnosAR
                </p>
              </div>
              {pacientesFAQs.map((faq, index) => {
                const IconComponent = faq.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">{faq.q}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {expandedFAQs[index] ? 'Ocultar respuesta' : 'Ver respuesta completa'}
                          </span>
                          {expandedFAQs[index] ? (
                            <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedFAQs[index] && (
                      <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="pt-4">
                          {formatAnswer(faq.a)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4">
              ¿No encontraste tu respuesta?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Nuestro equipo está aquí para ayudarte. Contactanos y te responderemos en menos de 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacto"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Contactar Soporte
              </a>
              <a
                href="/precios"
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Ver Planes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
