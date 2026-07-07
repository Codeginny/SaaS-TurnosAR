import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Sun, Moon } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { useUser } from '../context/UserContext';

const Layout = () => {
  const [dark, setDark] = useState(false);
  const { user, loading: userLoading, isProfessional } = useUser();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // Páginas que deben ocupar todo el ancho
  const fullWidthPages = [
    '/precios', 
    '/faq', 
    '/contacto', 
    '/dashboard',
    '/registro',
    '/login',
    '/soy-paciente',
    '/patient-login',
    '/patient-register',
    '/patient-dashboard',
    '/acerca-de',
    '/app',
    '/premios',
    '/professional/personal-info',
    '/professional/account-data',
    '/professional/collaborators',
    '/professional/banks',
    '/professional/addresses',
    '/professional/calendar'
  ];
  const isFullWidth = fullWidthPages.includes(location.pathname) || location.pathname.startsWith('/professional/');

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 dark:bg-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4 justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-blue-700 dark:text-blue-300">
            <CalendarDays size={22} /> TurnosAR 🇦🇷
          </Link>
          
          <nav className="flex items-center gap-3 text-sm flex-wrap">
            <NavLink to="/" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>Inicio</NavLink>
            <NavLink to="/acerca-de" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>Acerca de</NavLink>
            <NavLink to="/app" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>App</NavLink>
            <NavLink to="/precios" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>Planes</NavLink>
            <NavLink to="/faq" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>Preguntas Frecuentes</NavLink>
            <NavLink to="/contacto" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>Contacto</NavLink>
            
            {!userLoading && user && user.isProfessional ? (
              // Usuario profesional logueado - mostrar solo avatar
              <>
                <UserAvatar />
              </>
            ) : !userLoading && user ? (
              // Usuario paciente logueado - mostrar solo avatar
              <>
                <UserAvatar />
              </>
            ) : !userLoading ? (
              // Usuario no logueado - mostrar botones de login/registro
              <>
                <NavLink to="/soy-paciente" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Soy paciente</NavLink>
                <NavLink to="/login" className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40' : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}>Soy Profesional</NavLink>
              </>
            ) : null}
            
            <button onClick={toggleTheme} className="ml-2 p-2 rounded-lg border dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/30" aria-label="Cambiar tema">
              {dark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className={`flex-grow ${isFullWidth ? 'w-full' : 'max-w-screen-xl mx-auto px-4'}`}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        {/* Sección CTA/descarga o info principal */}
        <div className="max-w-7xl mx-auto py-12 px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Descargá nuestra app</h3>
          <p className="text-blue-100 mb-8">TurnosAR siempre a mano, donde estés</p>
          <div className="flex justify-center flex-wrap gap-4">
            <div className="flex items-center border border-blue-600 rounded-lg px-4 py-2 w-52 bg-blue-800/50 hover:bg-blue-700/50 transition-colors cursor-pointer">
              <img
                src="https://cdn-icons-png.flaticon.com/512/888/888857.png"
                alt="Google Play"
                className="w-7 md:w-8"
              />
              <div className="ml-3 text-left">
                <p className="text-xs text-blue-200">Descargar en</p>
                <p className="text-sm md:text-base font-semibold">Google Play</p>
              </div>
            </div>
            <div className="flex items-center border border-blue-600 rounded-lg px-4 py-2 w-52 bg-blue-800/50 hover:bg-blue-700/50 transition-colors cursor-pointer">
              <img
                src="https://cdn-icons-png.flaticon.com/512/888/888841.png"
                alt="Apple Store"
                className="w-7 md:w-8"
              />
              <div className="ml-3 text-left">
                <p className="text-xs text-blue-200">Descargar en</p>
                <p className="text-sm md:text-base font-semibold">Apple Store</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-blue-600 mx-6" />

        {/* Sección de enlaces y descripción */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-6 text-center md:text-left">
            <div>
              <h6 className="text-lg font-semibold mb-2 text-blue-100">Acerca de</h6>
              <Link to="/acerca-de" className="block text-blue-200 hover:text-white transition-colors">Nuestra historia</Link>
              <Link to="/acerca-de" className="block text-blue-200 hover:text-white transition-colors">Equipo</Link>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-2 text-blue-100">App</h6>
              <Link to="/precios" className="block text-blue-200 hover:text-white transition-colors">Planes</Link>
              <Link to="/app" className="block text-blue-200 hover:text-white transition-colors">Descargar</Link>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-2 text-blue-100">Premios</h6>
              <Link to="/premios" className="block text-blue-200 hover:text-white transition-colors">Reconocimientos</Link>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-2 text-blue-100">Ayuda</h6>
              <Link to="/faq" className="block text-blue-200 hover:text-white transition-colors">Soporte</Link>
              <Link to="/faq" className="block text-blue-200 hover:text-white transition-colors">FAQ</Link>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-2 text-blue-100">Contacto</h6>
              <Link to="/contacto" className="block text-blue-200 hover:text-white transition-colors">Email</Link>
              <Link to="/contacto" className="block text-blue-200 hover:text-white transition-colors">Teléfono</Link>
            </div>
          </div>

        </div>

        <hr className="border-blue-600 mx-6" />

        {/* Copyright y links pequeños */}
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-blue-200 text-sm">
          <p>&copy; {new Date().getFullYear()} TurnosAR 🇦🇷 · Todos los derechos reservados · Creado por CodeGinny (Ponce Virginia Alejandra)

          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Políticas</Link>
            <Link to="#" className="hover:text-white transition-colors">Términos</Link>
            <Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
