// 🔐 SERVICIO DE AUTENTICACIÓN - Sistema TurnosAR
// Centraliza todas las llamadas de autenticación al backend PostgreSQL

import { backendAPI } from '../api/axiosInstance';

// =============================================
// AUTENTICACIÓN DE PROFESIONALES
// =============================================

/**
 * Registra un nuevo profesional
 * @param {Object} profesionalData - Datos del profesional
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const registerProfessional = async (profesionalData) => {
  try {
    const response = await backendAPI.post('/register', profesionalData);
    return response.data;
  } catch (error) {
    console.error('Error en registro de profesional:', error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Autentica un profesional
 * @param {string} email - Email del profesional
 * @param {string} password - Contraseña del profesional
 * @returns {Promise<Object>} - Datos del profesional autenticado
 */
export const loginProfessional = async (email, password) => {
  try {
    const response = await backendAPI.post('/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en login de profesional:', error.response?.data?.error || error.message);
    throw error;
  }
};

// =============================================
// AUTENTICACIÓN DE PACIENTES
// =============================================

/**
 * Registra un nuevo paciente (auto-registro)
 * @param {string} dni - DNI del paciente
 * @param {string} password - Contraseña inicial (generalmente el DNI)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const registerPatient = async (dni, password) => {
  try {
    const response = await backendAPI.post('/patient-register', { dni, password });
    return response.data;
  } catch (error) {
    console.error('Error en registro de paciente:', error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Autentica un paciente
 * @param {string} dni - DNI del paciente
 * @param {string} password - Contraseña del paciente
 * @returns {Promise<Object>} - Datos del paciente autenticado
 */
export const loginPatient = async (dni, password) => {
  try {
    const response = await backendAPI.post('/patient-login', { dni, password });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (!errorMessage.includes('No existe un paciente')) {
      console.error('Error en login de paciente:', errorMessage);
    }
    throw error;
  }
};

/**
 * Cambia la contraseña de un profesional
 * @param {number} professionalId - ID del profesional
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const changeProfessionalPassword = async (professionalId, currentPassword, newPassword) => {
  try {
    const response = await backendAPI.put(`/professional-change-password/${professionalId}`, {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error en cambio de contraseña de profesional:', error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Cambia la contraseña de un paciente
 * @param {number} patientId - ID del paciente
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const changePatientPassword = async (patientId, currentPassword, newPassword) => {
  try {
    const response = await backendAPI.put(`/patient-change-password/${patientId}`, {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error en cambio de contraseña:', error.response?.data?.error || error.message);
    throw error;
  }
};

// =============================================
// VALIDACIÓN DE CREDENCIALES
// =============================================

/**
 * Valida credenciales de cualquier tipo de usuario
 * @param {string} dni - DNI del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} tipo - Tipo de usuario ('paciente' o 'profesional')
 * @returns {Promise<Object>} - Datos del usuario validado
 */
export const validateCredentials = async (dni, password, tipo) => {
  try {
    const response = await backendAPI.post('/validate-credentials', {
      dni,
      password,
      tipo
    });
    return response.data;
  } catch (error) {
    console.error('Error en validación de credenciales:', error.response?.data?.error || error.message);
    throw error;
  }
};

// =============================================
// GESTIÓN DE PERFILES
// =============================================

/**
 * Obtiene el perfil completo de un paciente
 * @param {number} patientId - ID del paciente
 * @returns {Promise<Object>} - Perfil del paciente
 */
export const getPatientProfile = async (patientId) => {
  try {
    const response = await backendAPI.get(`/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de paciente:', error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Actualiza el perfil de un paciente
 * @param {number} patientId - ID del paciente
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} - Perfil actualizado
 */
export const updatePatientProfile = async (patientId, profileData) => {
  try {
    const response = await backendAPI.put(`/patient/${patientId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar perfil de paciente:', error.response?.data?.error || error.message);
    throw error;
  }
};

// =============================================
// UTILIDADES DEL SISTEMA
// =============================================

/**
 * Verifica el estado del servidor
 * @returns {Promise<Object>} - Estado del servidor
 */
export const checkServerHealth = async () => {
  try {
    const response = await backendAPI.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error al verificar estado del servidor:', error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Obtiene estadísticas del sistema
 * @returns {Promise<Object>} - Estadísticas del sistema
 */
export const getSystemStats = async () => {
  try {
    const response = await backendAPI.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error.response?.data?.error || error.message);
    throw error;
  }
};

// =============================================
// MANEJO DE ERRORES
// =============================================

/**
 * Procesa errores de autenticación
 * @param {Error} error - Error capturado
 * @returns {string} - Mensaje de error amigable
 */
export const handleAuthError = (error) => {
  if (error.response) {
    // Error del servidor
    const status = error.response.status;
    const message = error.response.data?.error || 'Error desconocido';
    
    switch (status) {
      case 400:
        return 'Datos inválidos. Verifica la información ingresada.';
      case 401:
        return 'Credenciales incorrectas. Verifica tu DNI/email y contraseña.';
      case 404:
        return 'Usuario no encontrado.';
      case 409:
        return 'El usuario ya existe.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.';
      default:
        return message;
    }
  } else if (error.request) {
    // Error de conexión
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    // Error inesperado
    return 'Error inesperado. Intenta nuevamente.';
  }
};

// =============================================
// EXPORTACIONES
// =============================================

export default {
  // Profesionales
  registerProfessional,
  loginProfessional,
  
  // Pacientes
  registerPatient,
  loginPatient,
  changePatientPassword,
  
  // Validación
  validateCredentials,
  
  // Perfiles
  getPatientProfile,
  updatePatientProfile,
  
  // Sistema
  checkServerHealth,
  getSystemStats,
  
  // Utilidades
  handleAuthError
};
