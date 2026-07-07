import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {Object} Notification
 * @property {number} id - ID único de la notificación
 * @property {string} type - Tipo: turno, bienvenida, perfil, cancelacion
 * @property {string} message - Mensaje de la notificación
 * @property {Date} timestamp - Fecha y hora de creación
 * @property {boolean} read - Indica si fue leída
 * @property {string} action - Acción asociada: ver-turno, completar-perfil, ver-perfil, ver-turnos, none
 * @property {Object} actionData - Datos adicionales para la acción
 */

/**
 * @typedef {Object} NotificationContextValue
 * @property {Array<Notification>} notifications - Lista de notificaciones
 * @property {Function} addNotification - Agregar notificación genérica
 * @property {Function} addTurnoNotification - Agregar notificación de turno
 * @property {Function} addRegistroNotification - Agregar notificación de registro
 * @property {Function} addPerfilUpdateNotification - Agregar notificación de actualización de perfil
 * @property {Function} addCancelacionNotification - Agregar notificación de cancelación
 * @property {Function} markAsRead - Marcar notificación como leída
 * @property {Function} markAllAsRead - Marcar todas como leídas
 * @property {Function} clearNotifications - Limpiar todas las notificaciones
 * @property {Function} clearFakeNotifications - Limpiar notificaciones falsas de localStorage
 * @property {Function} getUnreadCount - Obtener conteo de no leídas
 */

const NotificationContext = createContext();

/**
 * Provider del contexto de notificaciones.
 * Maneja el estado global de notificaciones y persistencia en localStorage.
 * Filtra notificaciones falsas de datos de ejemplo.
 *
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Provider del contexto de notificaciones
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Cargar notificaciones desde localStorage al inicializar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Filtrar notificaciones falsas o de ejemplo
        const realNotifications = parsed.filter(notification => 
          !notification.message.includes('Dra. María González') &&
          !notification.message.includes('Dermatología') &&
          !notification.message.includes('Pediste un turno para') &&
          !notification.message.includes('Bienvenido a TurnosAR! Completa tu perfil') &&
          !notification.message.includes('Tu registro fue exitoso')
        );
        setNotifications(realNotifications);
        // Solo guardar si hay diferencias para evitar bucle infinito
        if (JSON.stringify(realNotifications) !== savedNotifications) {
          localStorage.setItem('notifications', JSON.stringify(realNotifications));
        }
      } catch (error) {
        console.error('Error parsing notifications:', error);
        localStorage.removeItem('notifications');
        setNotifications([]);
      }
    } else {
      // Si no hay notificaciones guardadas, asegurar que esté vacío
      setNotifications([]);
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien (solo si no es la carga inicial)
  useEffect(() => {
    // Solo guardar si ya se cargaron las notificaciones iniciales
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  /**
   * Agrega una nueva notificación al sistema.
   * Genera ID único y timestamp automáticamente.
   *
   * @param {Partial<Notification>} notification - Datos de la notificación
   * @returns {void}
   */
  const addNotification = (notification) => {
    const newNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      action: 'none',
      actionData: {},
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  /**
   * Agrega notificación de nuevo turno solicitado.
   *
   * @param {string} profesional - Nombre del profesional
   * @param {string} fecha - Fecha del turno
   * @param {string} hora - Hora del turno
   * @returns {void}
   */
  const addTurnoNotification = (profesional, fecha, hora) => {
    addNotification({
      type: 'turno',
      message: `Nuevo turno solicitado con ${profesional} el ${fecha} a las ${hora} hs.`,
      action: 'ver-turno',
      actionData: { fecha, hora, profesional }
    });
  };

  /**
   * Agrega notificación de bienvenida tras registro.
   *
   * @param {string} nombre - Nombre del usuario
   * @returns {void}
   */
  const addRegistroNotification = (nombre) => {
    addNotification({
      type: 'bienvenida',
      message: `¡Bienvenido ${nombre}! Tu registro fue exitoso.`,
      action: 'completar-perfil'
    });
  };

  /**
   * Agrega notificación de actualización de perfil.
   *
   * @returns {void}
   */
  const addPerfilUpdateNotification = () => {
    addNotification({
      type: 'perfil',
      message: 'Tu perfil se actualizó correctamente.',
      action: 'ver-perfil'
    });
  };

  /**
   * Agrega notificación de cancelación de turno.
   *
   * @param {string} profesional - Nombre del profesional
   * @param {string} fecha - Fecha del turno cancelado
   * @returns {void}
   */
  const addCancelacionNotification = (profesional, fecha) => {
    addNotification({
      type: 'cancelacion',
      message: `Se canceló el turno del ${fecha} con ${profesional}.`,
      action: 'ver-turnos'
    });
  };

  /**
   * Marca una notificación específica como leída.
   *
   * @param {number} notificationId - ID de la notificación
   * @returns {void}
   */
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  /**
   * Marca todas las notificaciones como leídas.
   *
   * @returns {void}
   */
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /**
   * Limpia todas las notificaciones del estado.
   *
   * @returns {void}
   */
  const clearNotifications = () => {
    setNotifications([]);
  };

  /**
   * Limpia notificaciones falsas de localStorage.
   *
   * @returns {void}
   */
  const clearFakeNotifications = () => {
    // Limpiar notificaciones falsas del localStorage
    localStorage.removeItem('notifications');
    setNotifications([]);
  };

  /**
   * Obtiene el conteo de notificaciones no leídas.
   *
   * @returns {number} Cantidad de notificaciones no leídas
   */
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notifications,
    addNotification,
    addTurnoNotification,
    addRegistroNotification,
    addPerfilUpdateNotification,
    addCancelacionNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearFakeNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de notificaciones.
 * Debe usarse dentro de NotificationProvider.
 *
 * @returns {NotificationContextValue} Valor del contexto de notificaciones
 * @throws {Error} Si se usa fuera de NotificationProvider
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
