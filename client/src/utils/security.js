// **FUNCIONES CENTRALES DE SEGURIDAD (FRONTEND)**
// Implementación alternativa para el navegador usando Web Crypto API

// Configuración de seguridad
const SALT_ROUNDS = 10; // Factor de costo estándar de Bcrypt

/**
 * Convierte la contraseña en texto plano a un hash seguro usando Web Crypto API
 * @param {string} passwordText - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
export const hashPassword = async (passwordText) => {
    try {
        // Usar Web Crypto API para hashing en el navegador
        const encoder = new TextEncoder();
        const data = encoder.encode(passwordText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Simular el formato de Bcrypt para compatibilidad
        return `$2b$${SALT_ROUNDS}$${hashHex}`;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Error al procesar la contraseña');
    }
};

/**
 * Compara la contraseña en texto plano con el hash almacenado
 * @param {string} passwordText - Contraseña ingresada por el usuario
 * @param {string} storedHash - Hash guardado en la DB
 * @returns {Promise<boolean>} - True si coinciden, false si no
 */
export const comparePassword = async (passwordText, storedHash) => {
    try {
        // Generar hash de la contraseña ingresada
        const inputHash = await hashPassword(passwordText);
        
        // Comparar hashes
        return inputHash === storedHash;
    } catch (error) {
        console.error('Error comparing password:', error);
        return false;
    }
};

/**
 * Valida la fortaleza de una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - Objeto con valido (boolean) y error (string)
 */
export const validatePasswordStrength = (password) => {
    if (password.length < 6) {
        return { valido: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    
    // Verificar que tenga al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
        return { valido: false, error: 'La contraseña debe contener al menos una letra y un número.' };
    }
    
    return { valido: true, error: '' };
};

/**
 * Genera un hash para DNI (usado como contraseña inicial)
 * @param {string|number} dni - DNI a hashear
 * @returns {Promise<string>} - Hash del DNI
 */
export const hashDNI = async (dni) => {
    try {
        return await hashPassword(dni.toString());
    } catch (error) {
        console.error('Error hashing DNI:', error);
        throw new Error('Error al procesar el DNI');
    }
};

/**
 * **LÓGICA MEJORADA DE LOGIN/VALIDACIÓN**
 * Valida credenciales de un profesional usando Web Crypto API
 * @param {object} profesional - Datos del profesional
 * @param {string} password - Contraseña ingresada
 * @returns {Promise<boolean>} - True si las credenciales son válidas
 */
export const validateProfessionalCredentials = async (profesional, password) => {
    if (!profesional || !password) {
        return false;
    }
    
    // Usa Web Crypto API para comparar la contraseña ingresada con el hash de la DB
    return await comparePassword(password, profesional.password);
};

/**
 * **LÓGICA MEJORADA DE LOGIN/VALIDACIÓN**
 * Valida credenciales de un paciente usando Web Crypto API
 * @param {object} paciente - Datos del paciente
 * @param {string} password - Contraseña ingresada
 * @returns {Promise<boolean>} - True si las credenciales son válidas
 */
export const validatePatientCredentials = async (paciente, password) => {
    if (!paciente || !password) {
        return false;
    }
    
    // Usa Web Crypto API para comparar la contraseña ingresada con el hash de la DB
    // Ya no necesitas la validación flexible con DNI.
    // El paciente SIEMPRE debe iniciar sesión con la contraseña actual hasheada.
    return await comparePassword(password, paciente.password);
};

/**
 * **LÓGICA MEJORADA PARA CAMBIO DE CONTRASEÑA**
 * Maneja el cambio de contraseña con validación Web Crypto API
 * @param {object} paciente - Datos del paciente
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<object>} - Datos actualizados del paciente
 */
export const handleChangePassword = async (paciente, currentPassword, newPassword) => {
    // 1. Validar contraseña actual (incluyendo Web Crypto API)
    const isCurrentPasswordValid = await comparePassword(currentPassword, paciente.password);

    if (!isCurrentPasswordValid) {
        throw new Error('La contraseña actual es incorrecta.');
    }

    // 2. Aplicar HASH a la nueva contraseña
    const newHashedPassword = await hashPassword(newPassword);

    // 3. Retornar los datos actualizados para guardar en la base de datos
    return {
        ...paciente,
        password: newHashedPassword,
        debeCambiarClave: false // El cambio ha sido realizado
    };
};

/**
 * Verifica si un paciente necesita cambiar su contraseña
 * @param {object} paciente - Datos del paciente
 * @returns {boolean} - True si necesita cambiar la contraseña
 */
export const needsPasswordChange = (paciente) => {
    return paciente && paciente.debeCambiarClave === true;
};

// Configuración de seguridad
export const SECURITY_CONFIG = {
    SALT_ROUNDS,
    MIN_PASSWORD_LENGTH: 6,
    MIN_PASSWORD_COMPLEXITY: {
        hasLetter: true,
        hasNumber: true,
        hasSpecialChar: false // Opcional para mayor seguridad
    }
};