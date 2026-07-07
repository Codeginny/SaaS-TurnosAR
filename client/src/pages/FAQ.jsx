import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('entidades');

  const entidadesFAQs = [
    {
      q: '¿Qué costo tiene para una entidad médica o profesional?',
      a: 'El costo depende del plan elegido: ofrecemos planes Estándar, Premium y Platino, adaptados según la cantidad de profesionales y funcionalidades requeridas. Puede consultar precios actualizados en nuestra sección Precios.'
    },
    {
      q: '¿Qué necesito para ofrecer TurnosAR a mis pacientes?',
      a: 'Solo necesita ponerse en contacto con nosotros. Se solicitarán datos de la entidad o profesional independiente y luego configuraremos su cuenta para que pueda brindar el servicio a sus pacientes.'
    },
    {
      q: '¿Puedo usar TurnosAR como un sistema interno, sin ofrecer turnos por Internet?',
      a: 'Sí, puede optar por un uso exclusivo interno, gestionando agendas y turnos sin que los pacientes vean disponibilidad en línea.'
    },
    {
      q: 'Soy profesional independiente. ¿Puede TurnosAR gestionar mi agenda de turnos?',
      a: 'Sí. TurnosAR permite la gestión de agendas individuales, incluyendo bloqueos, licencias y disponibilidad de manera simple y profesional.'
    },
    {
      q: '¿Cuánto tiempo lleva la configuración de TurnosAR para ofrecer el servicio?',
      a: 'Generalmente, la configuración inicial toma entre 24 y 48 horas, dependiendo de la complejidad de la entidad y la cantidad de profesionales a cargar.'
    },
    {
      q: '¿Se puede configurar el acceso a las agendas de turnos?',
      a: 'Sí, puede definir permisos de acceso para distintos profesionales y personal administrativo, garantizando seguridad y privacidad.'
    },
    {
      q: '¿Qué información puedo ofrecer a mis pacientes a través de TurnosAR?',
      a: 'Puede mostrar horarios disponibles, ubicación de la entidad, tipos de servicios, profesionales disponibles y requisitos para cada turno.'
    },
    {
      q: '¿Cómo gestiono las obras sociales que atiendo y cuáles no?',
      a: 'El sistema permite registrar todas las obras sociales aceptadas y configurar turnos según cobertura de cada paciente.'
    },
    {
      q: 'Los turnos cancelados por pacientes, ¿se vuelven activos para reasignar?',
      a: 'Sí, automáticamente los turnos cancelados se liberan y se pueden reasignar a otros pacientes.'
    },
    {
      q: '¿Puedo configurar feriados y licencias médicas de profesionales y suspender las agendas de ese período?',
      a: 'Sí, TurnosAR permite bloquear fechas por feriados o licencias, evitando que se asignen turnos durante esos días.'
    },
    {
      q: '¿Puedo obtener estadísticas de los turnos asignados en mi entidad?',
      a: 'Sí, puede generar reportes detallados de turnos por profesional, día, paciente y tipo de servicio.'
    },
    {
      q: '¿Ofrece algún listado de turnos por día para el profesional médico?',
      a: 'Sí, cada profesional puede consultar su agenda diaria con detalle de pacientes y horarios.'
    },
    {
      q: '¿Se puede tener una historia clínica para registrar la evolución de los pacientes?',
      a: 'Sí, TurnosAR incluye un módulo para registrar la evolución clínica, observaciones y documentación asociada a cada paciente.'
    }
  ];

  const pacientesFAQs = [
    {
      q: '¿Tiene algún costo para el paciente?',
      a: 'No, TurnosAR es gratuito para los pacientes al momento de reservar turnos.'
    },
    {
      q: '¿Puedo cancelar el turno en cualquier momento?',
      a: 'Sí, puede cancelar un turno desde la app o la web, respetando las políticas de cancelación de cada entidad.'
    },
    {
      q: '¿Puedo sacar un comprobante de turno?',
      a: 'Sí, al confirmar un turno puede generar un comprobante digital en PDF o enviarlo por correo electrónico.'
    },
    {
      q: '¿Puedo consultar dónde puedo atenderme?',
      a: 'Sí, la app permite localizar entidades médicas por dirección y zona geográfica.'
    },
    {
      q: '¿Puedo buscar un profesional registrado y consultar dónde atiende?',
      a: 'Sí, puede buscar profesionales por nombre, especialidad y ver sus lugares de atención.'
    },
    {
      q: '¿Cómo puedo encontrar información necesaria para poder atenderme en una entidad?',
      a: 'Cada turno incluye detalles de la entidad, requisitos, cobertura de obras sociales y documentos necesarios.'
    },
    {
      q: '¿Puedo conocer qué entidades atiende mi obra social?',
      a: 'Sí, TurnosAR permite filtrar entidades por obra social y mostrar solo aquellas que aceptan su cobertura.'
    },
    {
      q: '¿Recibo alertas o recordatorios de los turnos agendados?',
      a: 'Sí, enviamos recordatorios vía correo electrónico y notificaciones push para que no olvide sus turnos.'
    },
    {
      q: '¿Puedo pedir turno desde mi celular o tablet?',
      a: 'Sí, TurnosAR está optimizado para dispositivos móviles, permitiendo reservar turnos desde cualquier lugar.'
    },
    {
      q: '¿Recibiré novedades de TurnosAR y de las entidades donde he sacado turno?',
      a: 'Sí, puede suscribirse a notificaciones y recibir novedades, promociones o cambios importantes.'
    },
    {
      q: 'Si tengo alguna consulta, ¿puedo comunicarme con TurnosAR?',
      a: 'Sí, ofrecemos soporte a través de nuestro formulario de contacto, chat en línea o correo electrónico.'
    }
  ];

  return (
    <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="w-full px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Encontrá respuestas a las consultas más comunes sobre TurnosAR. Si no encontrás lo que buscás, 
            no dudes en <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors duration-300">contactarnos</a>.
          </p>
        </div>

        {/* Categorías */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveCategory('entidades')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeCategory === 'entidades'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
            }`}
          >
            Entidades y Profesionales
          </button>
          <button
            onClick={() => setActiveCategory('pacientes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeCategory === 'pacientes'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
            }`}
          >
            Pacientes
          </button>
        </div>

        {/* FAQ Content */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {activeCategory === 'entidades' ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">
                  Entidades y Profesionales
                </h2>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Preguntas frecuentes para clínicas, hospitales y profesionales de la salud
                </p>
              </div>
              {entidadesFAQs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
                  <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400 mb-3 transition-colors duration-300">{faq.q}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">{faq.a}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">
                  Pacientes
                </h2>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Preguntas frecuentes para pacientes que utilizan TurnosAR
                </p>
              </div>
              {pacientesFAQs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
                  <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400 mb-3 transition-colors duration-300">{faq.q}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">{faq.a}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 max-w-2xl mx-auto transition-colors duration-300">
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 transition-colors duration-300">
              ¿No encontraste tu respuesta?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
              Nuestro equipo está aquí para ayudarte. Contactanos y te responderemos en menos de 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacto"
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                Contactar Soporte
              </a>
              <a
                href="/precios"
                className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-300"
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



