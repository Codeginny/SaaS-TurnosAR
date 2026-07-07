const { z } = require('zod');

/**
 * **Integración como Middleware de Validación:**
 * 
 * Los esquemas Zod se integran en los controladores como middleware de validación
 * para sanitizar datos antes de procesar la lógica de negocio.
 * 
 * **Patrón de uso en controladores:**
 * ```javascript
 * const { registerProfessionalSchema } = require('../validators/schemas');
 * 
 * const registerProfessional = async (req, res, next) => {
 *   try {
 *     // Validación y sanitización de datos
 *     const validatedData = registerProfessionalSchema.parse(req.body);
 *     // validatedData contiene datos seguros y tipados
 *     const result = await createProfessional(validatedData);
 *     res.status(201).json(result);
 *   } catch (error) {
 *     if (error.name === 'ZodError') {
 *       // Error de validación es capturado por errorHandler
 *       return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
 *     }
 *     next(error); // Otros errores pasan al errorHandler global
 *   }
 * };
 * ```
 * 
 * **Ventajas de este enfoque:**
 * - Sanitización en runtime antes de procesar lógica de negocio
 * - Respuestas de error consistentes y user-friendly
 * - Tipado de datos para autocompletado en IDE
 * - Separación de responsabilidades (validación vs lógica)
 * 
 * **Flujo de seguridad:**
 * 1. Request llega al controlador
 * 2. Schema Zod valida estructura y tipos
 * 3. Datos sanitizados se extraen del parse
 * 4. Lógica de negocio procesa datos seguros
 * 5. ErrorHandler captura errores de validación
 */

/**
 * @typedef {Object} RegisterProfessionalInput
 * @property {string} nombre - Nombre completo del profesional (3-100 caracteres)
 * @property {string} email - Email válido (máx 255 caracteres)
 * @property {string} telefono - Teléfono (10-20 caracteres)
 * @property {string} especialidad - Especialidad médica (3-100 caracteres)
 * @property {string} password - Contraseña (6-100 caracteres)
 */

/**
 * @typedef {Object} LoginProfessionalInput
 * @property {string} email - Email válido
 * @property {string} password - Contraseña (mínimo 1 caracter)
 */

/**
 * @typedef {Object} RegisterPatientInput
 * @property {string} dni - DNI (7-9 dígitos numéricos)
 * @property {string} password - Contraseña (6-100 caracteres)
 */

/**
 * @typedef {Object} LoginPatientInput
 * @property {string} dni - DNI (7-9 dígitos numéricos)
 * @property {string} password - Contraseña (mínimo 1 caracter)
 */

/**
 * @typedef {Object} ChangePasswordInput
 * @property {string} currentPassword - Contraseña actual
 * @property {string} newPassword - Nueva contraseña (6-100 caracteres)
 */

/**
 * @typedef {Object} UpdatePatientInput
 * @property {string} [nombre] - Nombre (3-100 caracteres)
 * @property {string|null} [email] - Email válido (máx 255 caracteres)
 * @property {string|null} [telefono] - Teléfono (10-20 caracteres)
 * @property {string|null} [obraSocial] - Obra social (máx 100 caracteres)
 * @property {string|null} [direccion] - Dirección (máx 200 caracteres)
 * @property {string|null} [provincia] - Provincia (máx 100 caracteres)
 * @property {string|null} [localidad] - Localidad (máx 100 caracteres)
 * @property {string|null} [codigoPostal] - Código postal (máx 20 caracteres)
 * @property {string|null} [grupoSangre] - Grupo sanguíneo (máx 5 caracteres)
 * @property {string|null} [enfermedades] - Enfermedades preexistentes (máx 500 caracteres)
 * @property {string|null} [alergias] - Alergias (máx 500 caracteres)
 */

/**
 * @typedef {Object} ForgotPasswordInput
 * @property {string} [dni] - DNI (7-9 dígitos numéricos)
 * @property {string} [email] - Email válido
 */

/**
 * @typedef {Object} ResetPasswordInput
 * @property {string} newPassword - Nueva contraseña (6-100 caracteres)
 */

/**
 * @typedef {Object} ValidateCredentialsInput
 * @property {string} dni - DNI (7-9 dígitos numéricos)
 * @property {string} password - Contraseña
 * @property {'paciente'|'profesional'} tipo - Tipo de usuario
 */

/**
 * @typedef {Object} CreateAppointmentInput
 * @property {string} provincia - Provincia (3-100 caracteres)
 * @property {string} clinica - Clínica (3-100 caracteres)
 * @property {string} especialidad - Especialidad (3-100 caracteres)
 * @property {string} profesional - Nombre del profesional (3-100 caracteres)
 * @property {string} fecha - Fecha en formato YYYY-MM-DD
 * @property {string} hora - Hora en formato HH:MM
 * @property {string} pacienteId - ID del paciente (número como string)
 * @property {string|null} [pacienteNombre] - Nombre del paciente (máx 100 caracteres)
 * @property {string|null} [pacienteEmail] - Email del paciente (máx 255 caracteres)
 * @property {string|null} [pacienteTelefono] - Teléfono del paciente (máx 20 caracteres)
 * @property {number} [precioConsulta] - Precio de la consulta (positivo)
 */

/**
 * Esquema de validación Zod para registro de profesionales.
 * Valida nombre, email, teléfono, especialidad y contraseña.
 * 
 * **Uso como middleware:**
 * ```javascript
 * router.post('/register', async (req, res, next) => {
 *   try {
 *     const data = registerProfessionalSchema.parse(req.body);
 *     // data es { nombre, email, telefono, especialidad, password } validado
 *     await registerProfessional(data);
 *     res.status(201).json({ message: 'Registro exitoso' });
 *   } catch (error) {
 *     next(error); // Pasa al errorHandler que maneja ZodError
 *   }
 * });
 * ```
 *
 * @constant {z.ZodObject<RegisterProfessionalInput>}
 */
const registerProfessionalSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'El email no puede exceder 255 caracteres'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres').max(20, 'El teléfono no puede exceder 20 caracteres'),
  especialidad: z.string().min(3, 'La especialidad debe tener al menos 3 caracteres').max(100, 'La especialidad no puede exceder 100 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'La contraseña no puede exceder 100 caracteres'),
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(9, 'El DNI no puede exceder 9 caracteres').regex(/^\d+$/, 'El DNI debe contener solo números').optional()
});

/**
 * Esquema de validación Zod para login de profesionales.
 * Valida email y contraseña.
 *
 * @constant {z.ZodObject<LoginProfessionalInput>}
 */
const loginProfessionalSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

/**
 * Esquema de validación Zod para registro de pacientes.
 * Valida DNI (numérico) y contraseña.
 *
 * @constant {z.ZodObject<RegisterPatientInput>}
 */
const registerPatientSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(9, 'El DNI no puede exceder 9 caracteres').regex(/^\d+$/, 'El DNI debe contener solo números'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'La contraseña no puede exceder 100 caracteres')
});

/**
 * Esquema de validación Zod para login de pacientes.
 * Valida DNI (numérico) y contraseña.
 *
 * @constant {z.ZodObject<LoginPatientInput>}
 */
const loginPatientSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(9, 'El DNI no puede exceder 9 caracteres').regex(/^\d+$/, 'El DNI debe contener solo números'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

/**
 * Esquema de validación Zod para cambio de contraseña.
 * Valida contraseña actual y nueva contraseña.
 *
 * @constant {z.ZodObject<ChangePasswordInput>}
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula (A-Z)')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula (a-z)')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número (0-9)')
});

/**
 * Esquema de validación Zod para actualización de datos de paciente.
 * Todos los campos son opcionales y pueden ser nulos.
 *
 * @constant {z.ZodObject<UpdatePatientInput>}
 */
const updatePatientSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
  email: z.string().email('Email inválido').max(255, 'El email no puede exceder 255 caracteres').optional().nullable(),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres').max(20, 'El teléfono no puede exceder 20 caracteres').optional().nullable(),
  obraSocial: z.string().max(100, 'La obra social no puede exceder 100 caracteres').optional().nullable(),
  direccion: z.string().max(200, 'La dirección no puede exceder 200 caracteres').optional().nullable(),
  provincia: z.string().max(100, 'La provincia no puede exceder 100 caracteres').optional().nullable(),
  localidad: z.string().max(100, 'La localidad no puede exceder 100 caracteres').optional().nullable(),
  codigoPostal: z.string().max(20, 'El código postal no puede exceder 20 caracteres').optional().nullable(),
  grupoSangre: z.string().max(5, 'El grupo sanguíneo no puede exceder 5 caracteres').optional().nullable(),
  enfermedades: z.string().max(500, 'Las enfermedades no pueden exceder 500 caracteres').optional().nullable(),
  alergias: z.string().max(500, 'Las alergias no pueden exceder 500 caracteres').optional().nullable()
});

/**
 * Esquema de validación Zod para solicitud de recuperación de contraseña.
 * Requiere DNI o email (al menos uno de los dos).
 *
 * @constant {z.ZodObject<ForgotPasswordInput>}
 */
const forgotPasswordSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(9, 'El DNI no puede exceder 9 caracteres').regex(/^\d+$/, 'El DNI debe contener solo números').optional(),
  email: z.string().email('Email inválido').optional()
}).refine(data => data.dni || data.email, {
  message: 'Debe proporcionar DNI o email'
});

/**
 * Esquema de validación Zod para restablecimiento de contraseña.
 * Valida nueva contraseña (usado con token de recuperación).
 *
 * @constant {z.ZodObject<ResetPasswordInput>}
 */
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula (A-Z)')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula (a-z)')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número (0-9)')
});

/**
 * Esquema de validación Zod para validación de credenciales unificada.
 * Valida DNI, contraseña y tipo de usuario (paciente/profesional).
 * 
 * **Uso como middleware:**
 * ```javascript
 * router.post('/validate', async (req, res, next) => {
 *   try {
 *     const data = validateCredentialsSchema.parse(req.body);
 *     const user = await authenticateUser(data);
 *     res.json({ token: generateJWT(user) });
 *   } catch (error) {
 *     next(error); // Pasa al errorHandler que maneja ZodError
 *   }
 * });
 * ```
 *
 * @constant {z.ZodObject<ValidateCredentialsInput>}
 */
const validateCredentialsSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(9, 'El DNI no puede exceder 9 caracteres').regex(/^\d+$/, 'El DNI debe contener solo números'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  tipo: z.enum(['paciente', 'profesional'], { errorMap: () => ({ message: 'Tipo debe ser "paciente" o "profesional"' }) })
});

/**
 * Esquema de validación Zod para creación de turnos.
 * Valida datos de ubicación, profesional, fecha/hora y datos del paciente.
 * 
 * **Validaciones críticas:**
 * - Fecha formato YYYY-MM-DD (regex)
 * - Hora formato HH:MM (regex)
 * - pacienteId como número (regex)
 * - Campos opcionales nullable para flexibilidad
 * 
 * **Uso como middleware:**
 * ```javascript
 * router.post('/appointments', authenticateToken, async (req, res, next) => {
 *   try {
 *     const data = createAppointmentSchema.parse(req.body);
 *     const appointment = await createAppointment(data);
 *     res.status(201).json(appointment);
 *   } catch (error) {
 *     next(error); // Pasa al errorHandler que maneja ZodError
 *   }
 * });
 * ```
 *
 * @constant {z.ZodObject<CreateAppointmentInput>}
 */
const createAppointmentSchema = z.object({
  provincia: z.string().min(3, 'La provincia debe tener al menos 3 caracteres').max(100, 'La provincia no puede exceder 100 caracteres'),
  clinica: z.string().min(3, 'La clínica debe tener al menos 3 caracteres').max(100, 'La clínica no puede exceder 100 caracteres'),
  especialidad: z.string().min(3, 'La especialidad debe tener al menos 3 caracteres').max(100, 'La especialidad no puede exceder 100 caracteres'),
  profesional: z.string().min(3, 'El profesional debe tener al menos 3 caracteres').max(100, 'El profesional no puede exceder 100 caracteres'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'La hora debe tener formato HH:MM'),
  pacienteId: z.string().regex(/^\d+$/, 'El ID del paciente debe ser un número'),
  pacienteNombre: z.string().max(100, 'El nombre no puede exceder 100 caracteres').optional().nullable(),
  pacienteEmail: z.string().email('Email inválido').max(255, 'El email no puede exceder 255 caracteres').optional().nullable(),
  pacienteTelefono: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional().nullable(),
  precioConsulta: z.number().positive('El precio debe ser un número positivo').optional(),
  tipoCobertura: z.string().optional(),
  nroAfiliado: z.string().optional(),
  estadoValidacion: z.string().optional(),
  montoSena: z.number().optional(),
  statusSena: z.string().optional(),
  mercadoPagoId: z.string().optional()
});

/**
 * @typedef {Object} ExportStatsInput
 * @property {string} [range] - Selector rápido: 'month', 'quarter', 'year'
 * @property {string} [start] - Fecha inicio en formato YYYY-MM-DD (rango personalizado)
 * @property {string} [end] - Fecha fin en formato YYYY-MM-DD (rango personalizado)
 */

/**
 * Esquema de validación Zod para exportación de estadísticas a Excel.
 * Acepta un selector rápido (range) o un rango personalizado (start + end).
 * Valida que el rango personalizado no supere los 365 días corridos.
 *
 * @constant {z.ZodObject<ExportStatsInput>}
 */
const exportStatsSchema = z.object({
  range: z.enum(['month', 'quarter', 'year'], {
    errorMap: () => ({ message: 'range debe ser "month", "quarter" o "year"' })
  }).optional(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start debe tener formato YYYY-MM-DD').optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end debe tener formato YYYY-MM-DD').optional()
}).refine(data => data.range || (data.start && data.end), {
  message: 'Debe proporcionar range (month|quarter|year) o un rango personalizado (start + end)'
}).refine(data => {
  if (data.start && data.end) {
    const startDate = new Date(data.start);
    const endDate = new Date(data.end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 365;
  }
  return true;
}, {
  message: 'El rango personalizado no puede superar los 365 días corridos y end debe ser posterior a start'
});

module.exports = {
  registerProfessionalSchema,
  loginProfessionalSchema,
  registerPatientSchema,
  loginPatientSchema,
  changePasswordSchema,
  updatePatientSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateCredentialsSchema,
  createAppointmentSchema,
  exportStatsSchema
};
