import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

const Home = () => {
  const [role, setRole] = useState('paciente');

  const stats = [
    { value: 20000, label: "Profesionales usan TurnosAR 🇦🇷" },
    { value: 14000000, label: "Turnos procesados por año" },
    { value: 10000000, label: "Historias clínicas gestionadas" },
  ];

  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      const increment = Math.ceil(stat.value / 200); // ajusta velocidad
      return setInterval(() => {
        setCounts((prev) => {
          const newCounts = [...prev];
          if (newCounts[index] < stat.value) {
            newCounts[index] = Math.min(newCounts[index] + increment, stat.value);
          }
          return newCounts;
        });
      }, 20);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-blue-50 dark:bg-slate-900">

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-600 to-sky-500 text-white w-full">
        <div className="px-6 py-16 grid md:grid-cols-2 gap-8 items-center w-full max-w-screen-xl mx-auto">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Potenciá tu consultorio médico</h1>
            <p className="text-blue-50/90 text-lg mb-6">
              Con TurnosAR 🇦🇷 aumentás la rentabilidad de tu consultorio, reducís el ausentismo y ahorrás tiempo.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/registro" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-3 rounded-xl shadow hover:bg-blue-50">
                <CalendarDays size={20} /> Probar 15 días gratis
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-video w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30 bg-blue-100">
              <img 
                src="/imagenes/banners/clinica.jpg" 
                alt="Clínica" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* SECCIÓN DE NÚMEROS ANIMADOS */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-lg flex flex-col items-center justify-center"
            >
              <div className="text-5xl md:text-6xl font-extrabold text-blue-700 dark:text-blue-400">
                +{counts[idx].toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mt-4">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>


      {/* Beneficios para Pacientes */}
      <section className="max-w-screen-xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4">Beneficios para pacientes</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✔ Gestioná todos tus turnos médicos desde tu celular.</li>
            <li>✔ Descargá estudios médicos de forma rápida y segura.</li>
            <li>✔ Accedé a información completa de clínicas e instituciones asociadas.</li>
            <li>✔ Evitá colas, esperas y complicaciones para sacar un turno.</li>
            <li>✔ Reservá turnos en cualquier momento y lugar.</li>
            <li>✔ Agenda a la vista con filtros por profesional, especialidad y tipo de turno.</li>
          </ul>
        </div>

        {/* grid de imágenes */}
        <div className="grid grid-cols-2 gap-3">
          <img src="/imagenes/pacientes/imagen-1.jpg" alt="Paciente 1" className="rounded-xl shadow object-cover w-full aspect-[4/3]" />
          <img src="/imagenes/pacientes/imagen-2.jpg" alt="Paciente 2" className="rounded-xl shadow object-cover w-full aspect-[4/3]" />
          <img src="/imagenes/pacientes/imagen-3.jpg" alt="Paciente 3" className="rounded-xl shadow object-cover w-full aspect-[4/3]" />
          <img src="/imagenes/pacientes/imagen-4.jpg" alt="Paciente 4" className="rounded-xl shadow object-cover w-full aspect-[4/3]" />
        </div>
      </section>

      {/* Beneficios para Instituciones de Salud */}
      <section className="max-w-screen-xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4">Beneficios para instituciones de salud</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✔ Reducí el volumen de llamadas y optimizá el trabajo administrativo.</li>
            <li>✔ Atraé nuevos pacientes y fortalecé el vínculo con los actuales.</li>
            <li>✔ Posicioná tu institución como innovadora y orientada a la excelencia.</li>
            <li>✔ Comunicación directa, clara y eficiente con tus pacientes.</li>
            <li>✔ Agenda a la vista con filtros por profesional, especialidad y tipo de turno.</li>
          </ul>
        </div>

        {/* imagen alineada */}
        <div className="w-full rounded-xl overflow-hidden shadow">
          <img src="/imagenes/banners/clinica2.jpg" alt="Clínica2" className="w-full object-cover aspect-[4/3]" />
        </div>
      </section>

      {/* Funciones principales */}
      <section className="mx-auto w-full max-w-screen-xl px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6">Funciones principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Nuevo turno</h3>
            <p className="text-gray-700 dark:text-gray-300">Solicitá un turno directamente desde la app. Elegí especialidad y profesional, fecha y hora, y recibí confirmación instantánea.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Mis estudios</h3>
            <p className="text-gray-700 dark:text-gray-300">Accedé a tu historial médico y descargá informes y resultados de estudios en cualquier momento.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Mis turnos</h3>
            <p className="text-gray-700 dark:text-gray-300">Visualizá, confirmá o cancelá tus turnos. Los cambios se actualizan automáticamente.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Horarios médicos</h3>
            <p className="text-gray-700 dark:text-gray-300">Consultá profesionales por especialidad junto a sus dias y horarios de atención.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Notificaciones y recordatorios</h3>
            <p className="text-gray-700 dark:text-gray-300">Recibí alertas personalizadas sobre tus próximos turnos, estudios disponibles, y novedades de tus profesionales.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Clínicas asociadas</h3>
            <p className="text-gray-700 dark:text-gray-300">Explorá clínicas e instituciones de la red, con contacto, ubicación y redes sociales.</p>
          </div>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section className="mx-auto w-full max-w-screen-xl px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6">¿Cómo funciona?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Si sos paciente */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">Si sos paciente</h3>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300 mb-4">
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">1</span> Buscá el profesional o la empresa con la cual querés pedir un turno</li>
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">2</span> Tomá un turno</li>
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">3</span> Dejá tus datos</li>
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">4</span> ¡Listo! Recibís confirmación</li>
            </ol>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">No temas olvidarte, el día de tu turno vas a recibir un recordatorio por mail.</div>
            <div className="flex gap-3">
              <Link to="/turnero" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Pedir turno</Link>
              <Link to="/patient-login" className="px-4 py-2 rounded-lg border">Soy paciente</Link>
            </div>
          </div>

          {/* Si sos profesional o empresa */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">Si sos profesional o empresa</h3>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300 mb-4">
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">1</span> Registrate</li>
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">2</span> Creá tu turnero <span className="ml-2 inline-block text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">¡El primero bonificado el 1° año!</span></li>
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">3</span> Configurá días, horarios, frecuencias, etc.</li>
              <li className="flex gap-3"><span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">4</span> Divulgá tu turnero entre tus clientes, ¡y listo!</li>
            </ol>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Ocupate de tu negocio, TurnosAR 🇦🇷 acerca y organiza a tus pacientes.</div>
            <div className="flex gap-3">
              <Link to="/registro" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Registrarme</Link>
              <Link to="/precios" className="px-4 py-2 rounded-lg border">Ver precios</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;