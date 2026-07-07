// Base de datos mock para testing
// En producción, esto estaría en una base de datos real
import { faker } from '@faker-js/faker';
import { 
  CONFIG_CONTRASEÑAS, 
  CONFIG_USUARIOS, 
  CONFIG_CLINICAS 
} from '../config/fakerConfig.js';
import { hashDNI, hashPassword } from '../utils/security.js';

export const mockPacientes = [
  {
    id: "1",
    dni: 12345678,
    password: "$2b$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // Hash del DNI 12345678
    nombre: "María González López",
    email: "maria@email.com",
    telefono: "011-1234-5678",
    fecha: "2024-01-15T10:00:00.930Z",
    hora: "10:00",
    estado: "activo",
    profesional: "Dra. Ana López",
    debeCambiarClave: false, // Ya cambió su contraseña
    createdAt: 1705312800000
  },
  {
    id: "2",
    dni: 87654321,
    password: "$2b$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // Hash del DNI 87654321
    nombre: "Juan Carlos Pérez",
    email: "juan@email.com",
    telefono: "011-8765-4321",
    fecha: "2024-01-10T14:30:00.930Z",
    hora: "14:30",
    estado: "activo",
    profesional: "Dr. Roberto Silva",
    debeCambiarClave: false, // Ya cambió su contraseña
    createdAt: 1704892200000
  },
  {
    id: "3",
    dni: 98877665,
    password: "$2b$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // Hash del DNI 98877665
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
    estado: "pendiente",
    profesional: "",
    debeCambiarClave: true, // Debe cambiar su contraseña inicial
    createdAt: 1705755600000
  },
  {
    id: "4",
    dni: 11223344,
    password: "miNuevaPass123", // Contraseña personalizada
    nombre: "Laura Fernández",
    email: "laura@email.com",
    telefono: "011-1122-3344",
    fecha: "2024-01-05T16:45:00.930Z",
    hora: "16:45",
    estado: "activo",
    profesional: "Dra. Carmen Rodríguez",
    createdAt: 1704471900000
  }
];

export const mockProfesionales = [
  {
    id: 1,
    dni: "98765432",
    password: "$2b$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // Hash de "password123"
    nombre: "Dr. Carlos Rodríguez",
    email: "carlos.rodriguez@clinica.com",
    telefono: "011-9876-5432",
    especialidad: "Cardiología",
    clinica: "Clínica Santa María",
    provincia: "Buenos Aires",
    direccion: "Av. Corrientes 1234",
    localidad: "CABA",
    codigoPostal: "1043",
    matricula: "MP-12345",
    horarios: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    estado: "activo",
    createdAt: "2024-01-01T08:00:00.000Z"
  },
  {
    id: 2,
    dni: "87654321",
    password: "$2b$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // Hash de "password123"
    nombre: "Dra. María González",
    email: "maria.gonzalez@clinica.com",
    telefono: "011-8765-4321",
    especialidad: "Dermatología",
    clinica: "Centro Médico San José",
    provincia: "Buenos Aires",
    direccion: "Belgrano 567",
    localidad: "CABA",
    codigoPostal: "1094",
    matricula: "MP-67890",
    horarios: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"],
    estado: "activo",
    createdAt: "2024-01-01T08:00:00.000Z"
  }
];

// Función para buscar paciente por DNI
export const buscarPacientePorDNI = (dni) => {
  const dniNumero = parseInt(dni);
  return mockPacientes.find(p => p.dni === dniNumero);
};

// Función para buscar profesional por DNI
export const buscarProfesionalPorDNI = (dni) => {
  return mockProfesionales.find(p => p.dni === dni);
};

// **LÓGICA MEJORADA DE LOGIN/VALIDACIÓN**
// Función para validar credenciales con Bcrypt (simplificada)
export const validarCredenciales = async (dni, password, tipo = 'paciente') => {
  const user = tipo === 'paciente' 
    ? buscarPacientePorDNI(dni) 
    : buscarProfesionalPorDNI(dni);

  if (!user) return null;

  // Usa Bcrypt para comparar la contraseña ingresada con el hash de la DB
  const { comparePassword } = await import('../utils/security.js');
  const contraseñaValida = await comparePassword(password, user.password);

  // Ya no necesitas la validación flexible con DNI.
  // El paciente SIEMPRE debe iniciar sesión con la contraseña actual hasheada.

  return contraseñaValida ? user : null;
};

// Función para crear nuevo paciente con Bcrypt
export const crearPaciente = async (datosPaciente) => {
  // 🔑 PASO CLAVE: Hashear la contraseña antes de guardarla
  const hashedPassword = datosPaciente.password 
    ? await hashPassword(datosPaciente.password)
    : await hashDNI(datosPaciente.dni); // DNI como contraseña inicial

  const nuevoPaciente = {
    id: (mockPacientes.length + 1).toString(),
    dni: parseInt(datosPaciente.dni),
    password: hashedPassword, // ¡Guardar el HASH!
    nombre: datosPaciente.nombre || "",
    email: datosPaciente.email || "",
    debeCambiarClave: !datosPaciente.password, // Debe cambiar si no se proporcionó contraseña personalizada
    telefono: datosPaciente.telefono || "",
    fecha: "",
    hora: "",
    estado: "pendiente",
    profesional: "",
    createdAt: Date.now()
  };
  
  mockPacientes.push(nuevoPaciente);
  return nuevoPaciente;
};

// Función para actualizar paciente
export const actualizarPaciente = (id, datosActualizados) => {
  const index = mockPacientes.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPacientes[index] = { ...mockPacientes[index], ...datosActualizados };
    return mockPacientes[index];
  }
  return null;
};

// Función para obtener todos los pacientes
export const obtenerTodosLosPacientes = () => {
  return [...mockPacientes];
};

// Función para obtener todos los profesionales
export const obtenerTodosLosProfesionales = () => {
  return [...mockProfesionales];
};

// Función para validar formato de DNI
export const validarFormatoDNI = (dni) => {
  // Verificar que sea un número de 8 dígitos
  const dniString = dni.toString();
  
  // Debe tener exactamente 8 dígitos
  if (dniString.length !== 8) {
    return {
      valido: false,
      error: "El DNI debe tener exactamente 8 dígitos"
    };
  }
  
  // Solo debe contener números
  if (!/^\d{8}$/.test(dniString)) {
    return {
      valido: false,
      error: "El DNI solo puede contener números"
    };
  }
  
  // No debe ser 00000000
  if (dniString === "00000000") {
    return {
      valido: false,
      error: "El DNI no puede ser 00000000"
    };
  }
  
  return {
    valido: true,
    error: null
  };
};

// Función para validar contraseña
export const validarContraseña = (password) => {
  if (!password || password.trim() === "") {
    return {
      valido: false,
      error: "La contraseña no puede estar vacía"
    };
  }
  
  if (password.length < 6) {
    return {
      valido: false,
      error: "La contraseña debe tener al menos 6 caracteres"
    };
  }
  
  return {
    valido: true,
    error: null
  };
};

// Función para verificar si un DNI ya está registrado
export const dniYaRegistrado = (dni) => {
  return mockPacientes.some(paciente => paciente.dni === parseInt(dni));
};

// Función para obtener paciente por DNI (convertir a número) - ya definida arriba

// Función para generar contraseña segura con Faker.js
export const generarContraseñaSegura = (longitud = CONFIG_CONTRASEÑAS.LONGITUD_ESTANDAR) => {
  return faker.internet.password({ 
    length: longitud, 
    pattern: CONFIG_CONTRASEÑAS.PATRON_ESTANDAR,
    memorable: false 
  });
};

// Función para generar contraseña memorable
export const generarContraseñaMemorable = (longitud = CONFIG_CONTRASEÑAS.LONGITUD_MEMORABLE) => {
  return faker.internet.password({ 
    length: longitud, 
    memorable: true 
  });
};

// Función para generar contraseña con requisitos específicos
export const generarContraseñaConRequisitos = (opciones = {}) => {
  const {
    longitud = 12,
    incluirMayusculas = true,
    incluirMinusculas = true,
    incluirNumeros = true,
    incluirSimbolos = true
  } = opciones;

  let pattern = '';
  if (incluirMayusculas) pattern += 'A-Z';
  if (incluirMinusculas) pattern += 'a-z';
  if (incluirNumeros) pattern += '0-9';
  if (incluirSimbolos) pattern += '!@#$%^&*';

  return faker.internet.password({ 
    length: longitud, 
    pattern: new RegExp(`[${pattern}]`),
    memorable: false 
  });
};

// Función para generar múltiples usuarios con contraseñas únicas
export const generarUsuariosConContraseñas = (cantidad = 5, tipo = 'paciente') => {
  const usuarios = [];
  
  for (let i = 0; i < cantidad; i++) {
    const usuario = {
      id: Date.now() + i,
      dni: faker.string.numeric(8),
      password: generarContraseñaSegura(),
      nombre: faker.person.fullName(),
      email: faker.internet.email(),
      telefono: faker.phone.number('011-####-####'),
      fechaNacimiento: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
      provincia: faker.location.state(),
      createdAt: faker.date.past().toISOString(),
      estado: "activo"
    };

    if (tipo === 'paciente') {
      usuario.clinica = faker.company.name();
      usuario.especialidad = faker.helpers.arrayElement(['Cardiología', 'Dermatología', 'Ginecología', 'Pediatría', 'Traumatología']);
      usuario.profesional = faker.helpers.arrayElement(['Dr.', 'Dra.']) + ' ' + faker.person.fullName();
      usuario.obraSocial = faker.helpers.arrayElement(['OSDE', 'Swiss Medical', 'Galeno', 'Medicus', 'Particular']);
      usuario.direccion = faker.location.streetAddress();
      usuario.localidad = faker.location.city();
      usuario.codigoPostal = faker.location.zipCode('####');
      usuario.grupoSangre = faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
      usuario.enfermedades = faker.helpers.arrayElement(['Ninguna', 'Hipertensión', 'Diabetes', 'Asma']);
      usuario.alergias = faker.helpers.arrayElement(['Ninguna', 'Penicilina', 'Polen', 'Látex']);
      usuario.datosCompletados = faker.datatype.boolean();
    } else if (tipo === 'profesional') {
      usuario.especialidad = faker.helpers.arrayElement(['Cardiología', 'Dermatología', 'Ginecología', 'Pediatría', 'Traumatología']);
      usuario.clinica = faker.company.name();
      usuario.direccion = faker.location.streetAddress();
      usuario.localidad = faker.location.city();
      usuario.codigoPostal = faker.location.zipCode('####');
      usuario.matricula = 'MP-' + faker.string.numeric(5);
      usuario.horarios = faker.helpers.arrayElement([
        ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
        ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00'],
        ['10:00', '11:00', '12:00', '13:00', '16:00', '17:00']
      ]);
    }

    usuarios.push(usuario);
  }
  
  return usuarios;
};
