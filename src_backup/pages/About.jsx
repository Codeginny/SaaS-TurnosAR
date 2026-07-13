import React from 'react';
import { CalendarDays, Code, Palette, TrendingUp, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <CalendarDays className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Conoce la mente creativa detrás de TurnosAR y descubre cómo nació este proyecto
          </p>
        </div>

        {/* Historia personal */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Hola, soy CodeGinny!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Más conocida como Virginia Alejandra Ponce
          </p>
        </div>
        
        {/* Foto y texto en layout de dos columnas */}
        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          {/* Columna de fotos en zig zag vertical */}
          <div className="space-y-12">
            {/* Foto principal - arriba */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <img 
                  src="/imagenes/acerca-de/virginia-calendario.jpg" 
                  alt="Virginia Alejandra Ponce - Desarrolladora de TurnosAR"
                  className="w-64 h-64 rounded-full object-cover shadow-2xl border-4 border-white dark:border-slate-700"
                />

              </div>
            </div>
            
            {/* Segunda foto - abajo, alineada a la derecha */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <img 
                  src="/imagenes/acerca-de/uner-programacion.jpg" 
                  alt="UNER - Facultad de Programación"
                  className="w-64 h-64 rounded-full object-cover shadow-2xl border-4 border-white dark:border-slate-700"
                />

              </div>
            </div>
            
            {/* Tercera foto - más abajo, alineada con la primera */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <img 
                  src="/imagenes/acerca-de/unsl-analisis.jpg" 
                  alt="UNSL - Licenciatura en Análisis y Gestión de Datos"
                  className="w-64 h-64 rounded-full object-cover shadow-2xl border-4 border-white dark:border-slate-700"
                />

              </div>
            </div>
          </div>
          
          {/* Texto justificado */}
          <div className="prose prose-lg dark:prose-invert max-w-none text-justify">
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              Siempre me apasionó el diseño y la tecnología, y hoy puedo decir que combino lo mejor de ambos mundos.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              Actualmente estudio <strong>Programación en la UNER</strong> (graduación en julio 2026). Además, en diciembre 2026 voy a obtener el título intermedio de la <strong>Licenciatura en Análisis y Gestión de Datos en la UNSL</strong>. Estudio todo a distancia, lo que me permite organizar mis horarios y avanzar de manera independiente.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              Antes de dedicarme a la tecnología, completé 5 años de <strong>Licenciatura en Nutrición</strong>, pero descubrí que mi verdadera vocación estaba en el diseño y la programación.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              Trabajo hace más de <strong>10 años como diseñadora gráfica</strong> y tengo mi propia imprenta, con más de <strong>1500 clientes</strong> en mi provincia. Soy una apasionada de los negocios, siempre tengo ideas nuevas y las transformo en proyectos reales. He asesorado a varios emprendimientos que hoy se convirtieron en grandes empresas, y colaboré con marcas de distintos rubros.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Con las habilidades que adquirí en diseño, programación y negocios, me siento capaz de crear <strong>soluciones innovadoras y escalables</strong>. Puedo aportar muchísimo valor a cualquier empresa que confíe en mi trabajo.
            </p>
          </div>
        </div>

        {/* Equipo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 mb-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-blue-200" />
            <h2 className="text-2xl font-bold">Equipo</h2>
          </div>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-blue-100 mb-6 leading-relaxed">
              Este proyecto fue <strong>100% diseñado y desarrollado por mí</strong>. Desde la idea inicial, el diseño de la interfaz, la arquitectura del sistema, hasta la programación final: cada línea de código, cada pantalla y cada interacción fue pensada y construida con dedicación y pasión.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <Palette className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                <h3 className="font-semibold mb-2">Diseño UX/UI</h3>
                <p className="text-sm text-blue-200">Interfaces intuitivas y atractivas</p>
              </div>
              
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <Code className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                <h3 className="font-semibold mb-2">Desarrollo</h3>
                <p className="text-sm text-blue-200">Código limpio y escalable</p>
              </div>
              
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                <h3 className="font-semibold mb-2">Negocios</h3>
                <p className="text-sm text-blue-200">Estrategias de crecimiento</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        
      </div>
    </div>
  );
};

export default About;
