import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Bell, BarChart3, Calendar, Shield, Building, MapPin, CreditCard, Users, ChevronDown, ChevronRight, Stethoscope } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

const UserAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [shakeBell, setShakeBell] = useState(false);
  const { user, logout, isProfessional } = useUser();
  
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para obtener el conteo de notificaciones no leídas
  const getUnreadCount = () => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.read).length;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const formatTimestamp = (timestamp) => {
    // Asegurar que timestamp sea un objeto Date
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-AR');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Función para manejar el clic en una notificación
  const handleNotificationClick = (notification) => {
    try {
      // Marcar como leída
      markAsRead(notification.id);
      
      // Cerrar el dropdown de notificaciones
      setIsNotificationsOpen(false);
      
      // Manejar la acción específica
      if (notification.action && notification.action !== 'none') {
        handleNotificationAction(notification.action, notification.actionData);
      }
    } catch (error) {
      console.error('Error al manejar clic en notificación:', error);
      // Cerrar el dropdown en caso de error
      setIsNotificationsOpen(false);
    }
  };

  // Función para manejar las acciones de las notificaciones
  const handleNotificationAction = (action, actionData) => {
    try {
      switch (action) {
        case 'ver-turno':
          navigate('/patient-dashboard?tab=mis-turnos');
          break;
        case 'completar-perfil':
          navigate('/patient-dashboard?tab=perfil');
          break;
        case 'ver-perfil':
          navigate('/patient-dashboard?tab=perfil');
          break;
        case 'ver-turnos':
          navigate('/patient-dashboard?tab=mis-turnos');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error al navegar desde notificación:', error);
      // En caso de error, navegar a la página principal
      navigate('/');
    }
  };

  // Función para obtener el texto de la acción
  const getActionText = (action) => {
    switch (action) {
      case 'ver-turno':
        return 'ver el turno';
      case 'completar-perfil':
        return 'completar perfil';
      case 'ver-perfil':
        return 'ver perfil';
      case 'ver-turnos':
        return 'ver turnos';
      default:
        return 'ver más';
    }
  };

  if (!user) return null;

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'P'; // P de Paciente
    const trimmedName = name.trim();
    if (trimmedName === '') return 'P';
    
    // Obtener iniciales del nombre completo
    const initials = trimmedName
      .split(' ')
      .filter(word => word.length > 0) // Filtrar palabras vacías
      .map(word => word[0])
      .join('')
      .toUpperCase();
    
    // Retornar máximo 2 iniciales
    return initials.slice(0, 2);
  };

  return (
    <div className="relative flex items-center gap-4" ref={dropdownRef}>
      {/* Campanita de notificaciones */}
      <div className="relative" ref={notificationsRef}>
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`notification-bell relative p-2 text-gray-600 hover:text-blue-600 transition-colors group ${
            shakeBell ? 'animate-shake' : ''
          }`}
        >
          <Bell className={`bell-icon w-5 h-5 transition-transform duration-200 ${
            shakeBell ? 'animate-bell-ring' : ''
          }`} />
          {getUnreadCount() > 0 && (
            <span className="badge-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              {getUnreadCount() > 99 ? '99+' : getUnreadCount()}
            </span>
          )}
        </button>

        {/* Menú desplegable de notificaciones */}
        {isNotificationsOpen && (
          <div className="notification-dropdown absolute top-full right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto transform translate-x-0 sm:translate-x-0 max-w-[calc(100vw-2rem)] sm:max-w-none">
            <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Notificaciones</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {getUnreadCount()} sin leer
                  </p>
                </div>
                {getUnreadCount() > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium whitespace-nowrap ml-2"
                  >
                    Marcar todas
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-2">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item p-2 sm:p-3 rounded-lg mb-2 cursor-pointer ${
                      notification.read ? 'read' : 'unread'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                        notification.read ? 'bg-gray-400' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <span>🕑</span>
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {notification.action && notification.action !== 'none' && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                            👆 Toca para {getActionText(notification.action)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium">No hay notificaciones</p>
                  <p className="text-xs mt-1">Te notificaremos cuando haya novedades</p>
                </div>
              )}
            </div>
            
            {notifications && notifications.length > 0 && (
              <div className="p-2 sm:p-3 border-t border-gray-100 dark:border-slate-700 space-y-1 sm:space-y-2">
                <button
                  onClick={markAllAsRead}
                  className="w-full text-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/patient-dashboard?tab=mis-turnos');
                  }}
                  className="w-full text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-blue-50 transition-colors"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(user.nombre)}
        </div>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-none bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
          {/* Header del usuario */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(user.nombre)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user.nombre && user.nombre.trim() ? user.nombre : 'Paciente'}
                </h3>
                <p className="text-sm text-gray-600">
                  {user.email && user.email.trim() ? user.email : 'Completa tu perfil'}
                </p>
                {isProfessional && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                    Cuenta Premium Activa+
                  </span>
                )}
                {!isProfessional && (!user.nombre || !user.email) && (
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full mt-1">
                    Perfil incompleto
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="p-2">
            {isProfessional ? (
              // Menú para profesionales
              <>
                {/* Mi Perfil - Accordion */}
                <div className="mb-2">
                  <button 
                    onClick={() => toggleSection('profile')}
                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Mi Perfil</span>
                      </div>
                      {expandedSections.profile ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  {expandedSections.profile && (
                    <div className="ml-8 mt-2 space-y-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/professional/personal-info');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Información personal</span>
                      </div>
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/professional/account-data');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-blue-500" />
                        <span>Datos de tu cuenta</span>
                      </div>
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/professional/collaborators');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>Colaboradores</span>
                      </div>
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/professional/banks');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        <span>Bancos</span>
                      </div>
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/professional/addresses');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>Direcciones</span>
                      </div>
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/professional/calendar');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Calendario</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Turnos pendientes */}
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group mb-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Turnos pendientes</span>
                    <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                      5
                    </span>
                  </div>
                  <div className="ml-8 mt-2 space-y-1 text-sm text-gray-600">
                    <div className="bg-gray-50 p-2 rounded">María González - 15:30</div>
                    <div className="bg-gray-50 p-2 rounded">Juan Pérez - 16:00</div>
                    <div className="bg-gray-50 p-2 rounded">Ana López - 17:00</div>
                  </div>
                </button>

                {/* Configuración */}
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group mb-2">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Configuración</span>
                  </div>
                  <div className="ml-8 mt-2 text-sm text-gray-600">
                    Idioma, contraseña y ajustes generales
                  </div>
                </button>
              </>
            ) : (
              // Menú para pacientes
              <>
                {/* Mi Perfil - Accordion */}
                <div className="mb-2">
                  <button 
                    onClick={() => toggleSection('profile')}
                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Mi Perfil</span>
                        {(!user.nombre || !user.email) && (
                          <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                            Incompleto
                          </span>
                        )}
                      </div>
                      {expandedSections.profile ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  {expandedSections.profile && (
                    <div className="ml-8 mt-2 space-y-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <div 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/patient-dashboard?tab=perfil');
                        }}
                        className="flex items-center gap-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Información personal</span>
                        {(!user.nombre || !user.email) && (
                          <span className="ml-auto bg-red-100 text-red-700 text-xs px-1 py-0.5 rounded">
                            Requerido
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mis Turnos */}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/patient-dashboard?tab=mis-turnos');
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group mb-2"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Mis Turnos</span>
                    <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {user.turnosCount || 0}
                    </span>
                  </div>
                  <div className="ml-8 mt-2 text-sm text-gray-600">
                    Ver y gestionar tus turnos programados
                  </div>
                </button>

                {/* Solicitar Turno */}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/patient-dashboard?tab=turno');
                  }}
                  disabled={!user.nombre || !user.email}
                  className={`w-full text-left p-3 rounded-lg transition-colors group mb-2 ${
                    !user.nombre || !user.email 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Solicitar Turno</span>
                    {(!user.nombre || !user.email) && (
                      <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <div className="ml-8 mt-2 text-sm text-gray-600">
                    {!user.nombre || !user.email 
                      ? 'Completa tu perfil para solicitar turnos' 
                      : 'Agendar nueva cita médica'
                    }
                  </div>
                </button>

                {/* Completar Perfil - Solo mostrar si está incompleto */}
                {(!user.nombre || !user.email) && (
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/patient-dashboard');
                    }}
                    className="w-full text-left p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors group mb-2 border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">¡Completar Perfil!</span>
                      <span className="ml-auto bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Urgente
                      </span>
                    </div>
                    <div className="ml-8 mt-2 text-sm text-yellow-700">
                      Completa tu información personal para acceder a todas las funciones
                    </div>
                  </button>
                )}
              </>
            )}

            {/* Separador */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Salir */}
            <button
              onClick={handleLogout}
              className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-700">Salir</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
