import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Users, 
  CreditCard, 
  MapPin, 
  Calendar, 
  BarChart3,
  Home
} from 'lucide-react';

const ProfessionalSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: Home,
      description: 'Resumen general'
    },
    {
      path: '/professional/personal-info',
      name: 'Información Personal',
      icon: User,
      description: 'Datos personales y profesionales'
    },
    {
      path: '/professional/account-data',
      name: 'Datos de Cuenta',
      icon: Settings,
      description: 'Login y seguridad'
    },
    {
      path: '/professional/collaborators',
      name: 'Colaboradores',
      icon: Users,
      description: 'Gestión del equipo'
    },
    {
      path: '/professional/banks',
      name: 'Bancos',
      icon: CreditCard,
      description: 'Cuentas bancarias'
    },
    {
      path: '/professional/addresses',
      name: 'Direcciones',
      icon: MapPin,
      description: 'Lugares de atención'
    },
    {
      path: '/professional/calendar',
      name: 'Calendario',
      icon: Calendar,
      description: 'Horarios de atención'
    }
  ];

  return (
    <div className="w-full md:w-64 bg-white dark:bg-slate-800 shadow-lg dark:shadow-xl md:min-h-screen transition-colors duration-300 relative flex flex-col">
      {/* Header del sidebar */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 transition-colors duration-300">Panel Profesional</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">Gestioná tu consultorio</p>
      </div>

      {/* Menú de navegación */}
      <nav className="p-4 overflow-x-auto md:overflow-visible">
        <ul className="flex flex-row md:flex-col gap-2 md:space-y-2 md:space-x-0 w-max md:w-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group
                    ${isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                    }
                  `}
                >
                  <Icon 
                    className={`w-5 h-5 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                    }`} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{item.description}</div>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="hidden md:block absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors duration-300">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">TurnosAR Pro</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Cuenta Premium Activa</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSidebar;
