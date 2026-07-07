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
    <div className="w-64 bg-white shadow-lg min-h-screen">
      {/* Header del sidebar */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-700">Panel Profesional</h2>
        <p className="text-sm text-gray-600 mt-1">Gestioná tu consultorio</p>
      </div>

      {/* Menú de navegación */}
      <nav className="p-4">
        <ul className="space-y-2">
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
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                >
                  <Icon 
                    className={`w-5 h-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                    }`} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

    
    </div>
  );
};

export default ProfessionalSidebar;
