import React from 'react';
import { Shield, TrendingUp, Rocket, Code, Palette } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <span className="text-4xl">🇦🇷</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Acerca de TurnosAR
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            Infraestructura Digital para la Salud del Futuro
          </p>
        </div>

        {/* Introducción */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-12 mb-12">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
            TurnosAR es un ecosistema integral de gestión médica diseñado para eliminar la fricción operativa en el sector salud. Nuestra plataforma centraliza la interacción entre instituciones, profesionales y pacientes, transformando procesos administrativos complejos en flujos de datos ágiles, seguros y automatizados.
          </p>
        </div>

        {/* Arquitectura y Seguridad */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Arquitectura y Seguridad</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            La arquitectura de TurnosAR fue concebida bajo estándares de alta disponibilidad y escalabilidad, asegurando que la gestión de la salud no se detenga.
          </p>
          
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Core Tecnológico
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Desarrollado con un stack de alto rendimiento (React.js & Node.js), permitiendo una interfaz reactiva y una API RESTful capaz de procesar volúmenes críticos de solicitudes concurrentes.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Integridad de Datos
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Implementamos PostgreSQL como motor de base de datos, garantizando cumplimiento ACID y una estructura relacional robusta para el manejo de historias clínicas y transacciones sensibles.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad de Acceso
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Protocolos de autenticación con cifrado de extremo a extremo y flujos de validación de identidad (DNI/Token) para asegurar la privacidad del paciente bajo normativas de protección de datos personales.
              </p>
            </div>
          </div>
        </div>

        {/* Optimización del Consultorio */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Optimización del Consultorio</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Nuestra solución no solo agenda citas, sino que genera inteligencia operativa:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Reducción de Absentismo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Sistemas inteligentes de recordatorios que optimizan la tasa de asistencia.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <Code className="w-8 h-8 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Gestión de Capacidad</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Visualización en tiempo real de agendas médicas, permitiendo una distribución de carga eficiente por especialidad y profesional.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <Palette className="w-8 h-8 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Digitalización del Historial</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Centralización de información clínica básica y estudios para un diagnóstico más informado y rápido.</p>
            </div>
          </div>
        </div>

        {/* Roadmap de Innovación */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Roadmap de Innovación</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Estamos en constante evolución para liderar la transformación digital en salud:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Fintech Health</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Integración de pasarelas de pago para la gestión automatizada de copagos y consultas privadas.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Interoperabilidad HCE</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Conectividad avanzada con sistemas de Historias Clínicas Electrónicas.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Comunicación Cifrada</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Canal de mensajería segura entre profesional y paciente para seguimiento post-consulta.</p>
            </div>
          </div>
        </div>

        {/* El Respaldo Detrás del Sistema: Codeginny */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">El Respaldo Detrás del Sistema: Codeginny</h2>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              TurnosAR nace de la convergencia entre el diseño centrado en el usuario (UX/UI) y la ingeniería de datos.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Liderado por Virginia Alejandra Ponce, el proyecto combina 10 años de experiencia en comunicación visual con una sólida formación técnica en la Universidad Nacional de Entre Ríos (Desarrollo de Software) y la Universidad Nacional de San Luis (Análisis y Gestión de Datos). Esta visión interdisciplinaria garantiza que el sistema no solo sea técnicamente impecable, sino también intuitivo para el usuario final.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default About;
