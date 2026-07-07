// Configuración de Faker.js para el Sistema de Turnos
import { faker } from '@faker-js/faker';

// Configurar Faker (nueva API v10)
faker.setDefaultRefDate('2024-01-01T00:00:00.000Z');

// Configuraciones específicas para contraseñas
export const CONFIG_CONTRASEÑAS = {
  // Contraseña estándar para usuarios nuevos
  LONGITUD_ESTANDAR: 12,
  
  // Contraseña para profesionales (más segura)
  LONGITUD_PROFESIONAL: 16,
  
  // Contraseña memorable para usuarios que lo soliciten
  LONGITUD_MEMORABLE: 10,
  
  // Patrones de caracteres permitidos
  PATRON_ESTANDAR: /[A-Za-z0-9!@#$%^&*]/,
  PATRON_PROFESIONAL: /[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  
  // Requisitos mínimos
  REQUISITOS_MINIMOS: {
    mayusculas: true,
    minusculas: true,
    numeros: true,
    simbolos: true,
    longitudMinima: 8
  }
};

// Configuraciones para datos de usuarios
export const CONFIG_USUARIOS = {
  // Edades permitidas para pacientes
  EDAD_MINIMA: 18,
  EDAD_MAXIMA: 100,
  
  // Especialidades médicas disponibles
  ESPECIALIDADES: [
    'Cardiología',
    'Dermatología', 
    'Ginecología',
    'Pediatría',
    'Traumatología',
    'Neurología',
    'Oftalmología',
    'Otorrinolaringología',
    'Psiquiatría',
    'Urología',
    'Oncología',
    'Endocrinología'
  ],
  
  // Obras sociales disponibles
  OBRAS_SOCIALES: [
    'OSDE',
    'Swiss Medical',
    'Galeno',
    'Medicus',
    'Particular',
    'PAMI',
    'IOMA',
    'OSECAC',
    'OSECOR',
    'OSDEBA'
  ],
  
  // Grupos sanguíneos
  GRUPOS_SANGUINEOS: [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ],
  
  // Enfermedades comunes
  ENFERMEDADES_COMUNES: [
    'Ninguna',
    'Hipertensión',
    'Diabetes',
    'Asma',
    'Artritis',
    'Depresión',
    'Ansiedad',
    'Insomnio',
    'Migraña',
    'Alergias'
  ],
  
  // Alergias comunes
  ALERGIAS_COMUNES: [
    'Ninguna',
    'Penicilina',
    'Polen',
    'Látex',
    'Polvo',
    'Ácaros',
    'Mariscos',
    'Frutos secos',
    'Lactosa',
    'Gluten'
  ]
};

// Configuraciones para clínicas y profesionales
export const CONFIG_CLINICAS = {
  // Horarios disponibles
  HORARIOS_DISPONIBLES: [
    ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
    ['10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00'],
    ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  ],
  
  // Provincias argentinas
  PROVINCIAS: [
    'Buenos Aires',
    'CABA',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ]
};

// Función para obtener configuración completa
export const obtenerConfiguracionCompleta = () => {
  return {
    contraseñas: CONFIG_CONTRASEÑAS,
    usuarios: CONFIG_USUARIOS,
    clinicas: CONFIG_CLINICAS,
    faker: {
      locale: 'default',
      seed: faker.seed()
    }
  };
};

// Función para establecer seed específico (útil para testing)
export const establecerSeed = (seed) => {
  faker.seed(seed);
};

// Función para resetear seed a valor aleatorio
export const resetearSeed = () => {
  faker.seed();
};

export default faker;
