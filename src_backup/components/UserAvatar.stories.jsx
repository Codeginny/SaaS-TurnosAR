import UserAvatar from './UserAvatar';

export default {
  title: 'Components/UserAvatar',
  component: UserAvatar,
  parameters: {
    docs: {
      description: {
        component: 'Componente de avatar de usuario que muestra la imagen del perfil y notificaciones.',
      },
    },
  },
  argTypes: {
    user: {
      control: 'object',
      description: 'Objeto de usuario con información del perfil',
    },
    notifications: {
      control: 'object',
      description: 'Array de notificaciones del usuario',
    },
  },
  tags: ['autodocs'],
};

// Usuario con imagen
export const WithImage = {
  args: {
    user: {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      avatar: '/imagenes/pacientes/imagen-1.jpg',
    },
    notifications: [
      {
        id: '1',
        message: 'Tu turno ha sido confirmado',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        message: 'Recordatorio: turno mañana a las 10:00',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
      },
    ],
  },
};

// Usuario sin imagen (iniciales)
export const WithoutImage = {
  args: {
    user: {
      id: '2',
      name: 'María García',
      email: 'maria@example.com',
      avatar: null,
    },
    notifications: [],
  },
};

// Usuario con muchas notificaciones
export const WithManyNotifications = {
  args: {
    user: {
      id: '3',
      name: 'Carlos López',
      email: 'carlos@example.com',
      avatar: '/imagenes/pacientes/imagen-2.jpg',
    },
    notifications: [
      {
        id: '1',
        message: 'Nuevo mensaje del profesional',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        message: 'Turno reprogramado',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
      },
      {
        id: '3',
        message: 'Recordatorio de pago',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
      },
      {
        id: '4',
        message: 'Confirmación de asistencia',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ],
  },
};

// Usuario profesional
export const ProfessionalUser = {
  args: {
    user: {
      id: '4',
      name: 'Dr. Ana Martínez',
      email: 'ana.martinez@clinica.com',
      avatar: '/imagenes/logo/logo1.png',
      role: 'professional',
    },
    notifications: [
      {
        id: '1',
        message: 'Nuevo turno solicitado',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        message: 'Paciente canceló turno',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ],
  },
};

// Estado de carga
export const Loading = {
  args: {
    user: null,
    notifications: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado cuando el usuario aún no ha cargado.',
      },
    },
  },
};

// Modo oscuro
export const DarkMode = {
  args: {
    user: {
      id: '5',
      name: 'Roberto Silva',
      email: 'roberto@example.com',
      avatar: '/imagenes/pacientes/imagen-3.jpg',
    },
    notifications: [
      {
        id: '1',
        message: 'Bienvenido a TurnosAR',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ],
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
