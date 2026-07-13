import React from 'react';
import { Award, Trophy, Star, Medal, Target, TrendingUp, Users, CalendarDays } from 'lucide-react';

const Awards = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6">
            <Award className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Premios y Reconocimientos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Celebrando los logros y la excelencia en el desarrollo de soluciones tecnológicas
          </p>
        </div>

        {/* Mensaje de desarrollo */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-8 md:p-12 mb-12 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">En Desarrollo</h2>
          <p className="text-yellow-100 text-lg max-w-2xl mx-auto">
            Esta sección está en construcción. Pronto compartiremos los reconocimientos y premios que TurnosAR ha recibido por su innovación y excelencia en el desarrollo de software médico.
          </p>
        </div>

        {/* Logros del proyecto */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Logros del Proyecto
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usuarios Satisfechos</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Creciendo día a día con feedback positivo</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Crecimiento Constante</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Expansión continua de funcionalidades</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Turnos Gestionados</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Miles de citas organizadas exitosamente</p>
            </div>
            
            <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Star className="w-12 h-12 mx-auto mb-4 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Calidad Premium</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Estándares de excelencia en cada función</p>
            </div>
          </div>
        </div>

        {/* Metas futuras */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 mb-12 text-white">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Metas y Objetivos</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Nuestro compromiso es seguir innovando y mejorando para ofrecer la mejor experiencia posible
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <Medal className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Certificaciones</h3>
              <p className="text-blue-200">Obtener certificaciones de calidad y seguridad médica</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <Award className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Premios de Innovación</h3>
              <p className="text-blue-200">Participar en concursos de tecnología médica</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <Star className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Reconocimiento del Mercado</h3>
              <p className="text-blue-200">Ser referente en gestión de turnos médicos</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Awards;
