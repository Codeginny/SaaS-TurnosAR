import React from 'react';
import { CalendarDays, Smartphone, Globe, Zap, Shield, Users, BarChart3, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            App TurnosAR
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Aplicación móvil para la gestión de turnos y citas médicas
          </p>
        </div>

        {/* App Móvil */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">App Móvil</h2>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                La aplicación móvil está en proceso de desarrollo. Una vez finalizada, estará disponible en <strong>Google Play Store</strong> junto con el lanzamiento completo de este Sistema de turnos web.
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                El objetivo es garantizar que la app ofrezca una <strong>experiencia simple, rápida y profesional</strong> para todos los usuarios.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Interfaz intuitiva y fácil de usar</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Notificaciones push en tiempo real</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Sincronización automática con la web</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Acceso offline a información básica</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm">
                  <Zap className="w-4 h-4" />
                  Próximamente disponible
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-64 h-96 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center">
                  <Smartphone className="w-32 h-32 text-white opacity-80" />
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                  En desarrollo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema Web */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 mb-12 text-white">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Sistema Web</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Plataforma completa y profesional para la gestión de turnos médicos, disponible ahora mismo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Gestión de Pacientes</h3>
              <p className="text-blue-200">Administra historiales médicos y datos de contacto de manera segura</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Calendario Inteligente</h3>
              <p className="text-blue-200">Sistema de reservas con confirmaciones automáticas</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Reportes y Analytics</h3>
              <p className="text-blue-200">Métricas detalladas para optimizar tu consulta</p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/precios" 
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-semibold transition-colors"
            >
              <CalendarDays className="w-5 h-5" />
              Ver Planes Disponibles
            </Link>
          </div>
        </div>

        {/* Características */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Características de la App
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Seguridad</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Datos protegidos con encriptación de nivel bancario</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Zap className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rapidez</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Interfaz optimizada para máxima eficiencia</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Globe className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accesibilidad</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Funciona en cualquier dispositivo y navegador</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Soporte</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Asistencia técnica personalizada disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
