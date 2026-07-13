// 🛡️ SERVIDOR BACKEND - Sistema TurnosAR con PostgreSQL
// Arquitectura: Frontend ↔ Backend/Express ↔ PostgreSQL
// Maneja autenticación y seguridad con Bcrypt

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const { query, pool } = require('./database/config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { authenticateToken, authorize } = require('./middleware/authMiddleware');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configurar variables de entorno
const envPath = path.join(__dirname, '.env');
console.log('Ruta del .env en index.js:', envPath);
dotenv.config({ path: envPath });

async function autoMigrate() {
  try {
    await pool.query(`
      ALTER TABLE pacientes 
      ADD COLUMN IF NOT EXISTS debe_cambiar_clave BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS obra_social VARCHAR(100),
      ADD COLUMN IF NOT EXISTS direccion VARCHAR(200),
      ADD COLUMN IF NOT EXISTS provincia VARCHAR(100),
      ADD COLUMN IF NOT EXISTS localidad VARCHAR(100),
      ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20),
      ADD COLUMN IF NOT EXISTS grupo_sangre VARCHAR(10),
      ADD COLUMN IF NOT EXISTS enfermedades TEXT,
      ADD COLUMN IF NOT EXISTS alergias TEXT,
      ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ Esquema de base de datos sincronizado automáticamente');
  } catch (err) {
    console.error('❌ Error al sincronizar esquema:', err);
  }
}

// Probar conexión a la base de datos
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('➡️ Verifica la contraseña en tu archivo .env');
    }
  } else {
    console.log('✅ Conexión a PostgreSQL verificada:', { now: res.rows[0].now });
    await autoMigrate();
  }
});

// Inicializar la aplicación Express (movido hacia abajo)

// Importar controladores
const {
  registerProfessional,
  loginProfessional,
  registerPatient,
  loginPatient,
  changeProfessionalPassword,
  changePatientPassword,
  forgotPassword,
  resetPassword,
  validateCredentials,
  getProfessionals,
  refreshToken
} = require('./controllers/authController');

const {
  updatePatient,
  getPatient,
  getAllPatients
} = require('./controllers/patientController');

const {
  createAppointment,
  getAppointmentsByPatient,
  getAllAppointments,
  validateTokenAndRefund
} = require('./controllers/appointmentController');

const {
  healthCheck,
  getStats
} = require('./controllers/healthController');

const {
  getProfessionalStats,
  getCapacityAnalytics,
  exportStatsToExcel,
  exportStatsCSV
} = require('./controllers/statsController');

const {
  generateInvoice,
  getInvoice
} = require('./controllers/billingController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TurnosAR API',
      version: '2.0.0',
      description: 'API para el sistema de gestión de turnos médicos TurnosAR',
      contact: {
        name: 'Codeginny',
        email: 'contact@turnosar.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        ProfessionalRegister: {
          type: 'object',
          required: ['nombre', 'email', 'telefono', 'especialidad', 'password'],
          properties: {
            nombre: { type: 'string', minLength: 3, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string', minLength: 10, maxLength: 20 },
            especialidad: { type: 'string', minLength: 3, maxLength: 100 },
            password: { type: 'string', minLength: 6, maxLength: 100 }
          }
        },
        PatientRegister: {
          type: 'object',
          required: ['dni', 'password'],
          properties: {
            dni: { type: 'string', minLength: 7, maxLength: 9, pattern: '^\\d+$' },
            password: { type: 'string', minLength: 6, maxLength: 100 }
          }
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        PatientLogin: {
          type: 'object',
          required: ['dni', 'password'],
          properties: {
            dni: { type: 'string', minLength: 7, maxLength: 9, pattern: '^\\d+$' },
            password: { type: 'string' }
          }
        },
        ChangePassword: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6, maxLength: 100 }
          }
        },
        UpdatePatient: {
          type: 'object',
          properties: {
            nombre: { type: 'string', minLength: 3, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string', minLength: 10, maxLength: 20 },
            obraSocial: { type: 'string', maxLength: 100 },
            direccion: { type: 'string', maxLength: 200 },
            provincia: { type: 'string', maxLength: 100 },
            localidad: { type: 'string', maxLength: 100 },
            codigoPostal: { type: 'string', maxLength: 20 },
            grupoSangre: { type: 'string', maxLength: 5 },
            enfermedades: { type: 'string', maxLength: 500 },
            alergias: { type: 'string', maxLength: 500 }
          }
        },
        Appointment: {
          type: 'object',
          required: ['provincia', 'clinica', 'especialidad', 'profesional', 'fecha', 'hora', 'pacienteId'],
          properties: {
            provincia: { type: 'string', minLength: 3, maxLength: 100 },
            clinica: { type: 'string', minLength: 3, maxLength: 100 },
            especialidad: { type: 'string', minLength: 3, maxLength: 100 },
            profesional: { type: 'string', minLength: 3, maxLength: 100 },
            fecha: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            hora: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
            pacienteId: { type: 'string', pattern: '^\\d+$' },
            pacienteNombre: { type: 'string', maxLength: 100 },
            pacienteEmail: { type: 'string', format: 'email' },
            pacienteTelefono: { type: 'string', maxLength: 20 }
          }
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            token: { 
              type: 'string',
              description: 'Nuevo access token JWT válido por 15 minutos'
            }
          }
        },
        ValidateTokenRequest: {
          type: 'object',
          required: ['tokenVivo'],
          properties: {
            tokenVivo: {
              type: 'string',
              minLength: 6,
              maxLength: 6,
              pattern: '^\\d{6}$',
              description: 'Token de validación de 6 dígitos proporcionado por la obra social'
            }
          }
        },
        ValidateTokenResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de confirmación de validación y reintegro'
            },
            turno: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'ID del turno validado' },
                montoReintegrado: { type: 'number', description: 'Monto de la seña reintegrada' },
                paymentId: { type: 'string', description: 'ID del pago de Mercado Pago' },
                tiempoEstimado: { type: 'string', description: 'Tiempo estimado para que el reintegro aparezca en el banco' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' }
          }
        }
      }
    }
  },
  apis: ['./controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'https://tu-sitio-en-vercel.vercel.app',
    'https://turnosar.vercel.app',
    'https://saa-s-turnos-ar.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =============================================
// ENDPOINTS DE AUTENTICACIÓN (Públicos)
// =============================================

app.post('/api/register', registerProfessional);
app.post('/api/login', loginProfessional);
app.post('/api/patient-register', registerPatient);
app.post('/api/patient-login', loginPatient);
app.post('/api/forgot-password', forgotPassword);
app.post('/api/reset-password/:token', resetPassword);
app.get('/api/profesionales', getProfessionals);
app.post('/api/validate-credentials', validateCredentials);
app.post('/api/refresh-token', refreshToken);

// =============================================
// ENDPOINTS DE AUTENTICACIÓN (Protegidos)
// =============================================

// Solo profesionales pueden cambiar su contraseña
app.put('/api/professional-change-password/:id', authenticateToken, authorize(['professional']), changeProfessionalPassword);

// Solo pacientes pueden cambiar su contraseña
app.put('/api/patient-change-password/:id', authenticateToken, authorize(['patient']), changePatientPassword);

// =============================================
// ENDPOINTS DE GESTIÓN DE DATOS (Protegidos)
// =============================================

// Solo pacientes pueden actualizar sus datos
app.put('/api/patient/:id', authenticateToken, authorize(['patient']), updatePatient);

// Solo pacientes pueden ver su perfil
app.get('/api/patient/:id', authenticateToken, authorize(['patient']), getPatient);

// Solo profesionales pueden ver todos los pacientes
app.get('/api/pacientes', authenticateToken, authorize(['professional']), getAllPatients);

// =============================================
// ENDPOINTS DE TURNOS (Protegidos)
// =============================================

// Ambos pueden crear turnos, con validación de dueño en el controlador
app.post('/api/turnos', authenticateToken, authorize(['patient', 'professional']), createAppointment);

// Solo pacientes pueden ver sus turnos (validación de dueño en controlador)
app.get('/api/turnos/paciente/:id', authenticateToken, authorize(['patient']), getAppointmentsByPatient);

// Solo profesionales pueden ver todos los turnos
app.get('/api/turnos', authenticateToken, authorize(['professional']), getAllAppointments);

// Validar token de obra social y reintegrar seña (para recepcionistas)
app.put('/api/turnos/:id/validar-token', authenticateToken, authorize(['professional']), validateTokenAndRefund);

// =============================================
// ENDPOINTS DE SISTEMA
// =============================================

app.get('/api/health', healthCheck);

// Solo profesionales pueden ver estadísticas generales
app.get('/api/stats', authenticateToken, authorize(['professional']), getStats);

// Solo profesionales pueden ver sus estadísticas detalladas
app.get('/api/stats/professional', authenticateToken, authorize(['professional']), getProfessionalStats);

// Solo profesionales pueden ver análisis de capacidad (Heatmap)
app.get('/api/stats/capacity', authenticateToken, authorize(['professional']), getCapacityAnalytics);

// RF-001: Exportación de estadísticas a Excel (.xlsx) con streams
app.get('/api/stats/export', authenticateToken, authorize(['professional']), exportStatsToExcel);

// RF-001: Exportación de estadísticas a CSV
app.get('/api/stats/export-csv', authenticateToken, authorize(['professional']), exportStatsCSV);

// Facturación Electrónica (AFIP-Ready)
app.post('/api/billing/generate', authenticateToken, authorize(['professional']), generateInvoice);
app.get('/api/billing/invoice/:turnoId', authenticateToken, authorize(['professional']), getInvoice);

// =============================================
// MANEJO DE ERRORES
// =============================================

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// =============================================
// INICIALIZACIÓN DEL SERVIDOR
// =============================================

const startServer = async () => {
  try {
    // Verificar conexión a PostgreSQL
    const result = await query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL verificada:', result.rows[0]);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🛡️ Servidor Backend TurnosAR ejecutándose en puerto ${PORT}`);
      console.log(`🗄️ Base de datos: PostgreSQL (turnos_medicos_db)`);
      console.log(`🔐 Endpoints de seguridad disponibles:`);
      console.log(`   - POST /api/register (Registro de profesionales)`);
      console.log(`   - POST /api/login (Login de profesionales)`);
      console.log(`   - POST /api/patient-register (Registro de pacientes)`);
      console.log(`   - POST /api/patient-login (Login de pacientes)`);
      console.log(`   - PUT /api/patient-change-password/:id (Cambio de contraseña)`);
      console.log(`   - POST /api/forgot-password (Solicitar recuperación de contraseña)`);
      console.log(`   - POST /api/reset-password/:token (Restablecer contraseña con token)`);
      console.log(`   - POST /api/validate-credentials (Validación de credenciales)`);
      console.log(`   - GET /api/patient/:id (Obtener perfil de paciente)`);
      console.log(`   - PUT /api/patient/:id (Actualizar perfil de paciente)`);
      console.log(`   - POST /api/turnos (Crear turno médico)`);
      console.log(`   - GET /api/turnos/paciente/:id (Obtener turnos de paciente)`);
      console.log(`   - GET /api/health (Estado del servidor)`);
      console.log(`   - GET /api/stats (Estadísticas del sistema)`);
      console.log(`🏗️ Arquitectura: Frontend ↔ Backend/Express ↔ PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;
