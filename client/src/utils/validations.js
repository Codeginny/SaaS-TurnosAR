// Validaciones para formularios profesionales

/**
 * Valida formato de celular argentino
 * Formato esperado: 54XXXXXXXXXX (12 dígitos total, empezando con 54)
 * @param {string} phone - Número de teléfono a validar
 * @returns {object} - Objeto con isValid y message
 */
export const validateArgentinePhone = (phone) => {
  // Remover espacios y caracteres especiales
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(phone)) {
    return {
      isValid: false,
      message: 'El teléfono solo debe contener números'
    };
  }
  
  // Verificar longitud exacta de 12 dígitos
  if (cleanPhone.length !== 12) {
    return {
      isValid: false,
      message: 'El teléfono debe tener exactamente 12 dígitos'
    };
  }
  
  // Verificar que empiece con "54"
  if (!cleanPhone.startsWith('54')) {
    return {
      isValid: false,
      message: 'El teléfono debe comenzar con "54" (Argentina)'
    };
  }
  
  // Verificar que después del 54 haya exactamente 10 dígitos
  const afterPrefix = cleanPhone.substring(2);
  if (afterPrefix.length !== 10) {
    return {
      isValid: false,
      message: 'Después del "54" deben seguir exactamente 10 dígitos'
    };
  }
  
  return {
    isValid: true,
    message: 'Formato válido'
  };
};

/**
 * Formatea el número de teléfono para mostrar
 * @param {string} phone - Número de teléfono
 * @returns {string} - Número formateado
 */
export const formatPhoneForDisplay = (phone) => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 12 && cleanPhone.startsWith('54')) {
    const prefix = cleanPhone.substring(0, 2);
    const area = cleanPhone.substring(2, 4);
    const firstPart = cleanPhone.substring(4, 7);
    const secondPart = cleanPhone.substring(7, 9);
    const thirdPart = cleanPhone.substring(9, 11);
    
    return `+${prefix} ${area} ${firstPart}-${secondPart}${thirdPart}`;
  }
  
  return phone;
};

/**
 * Limpia el número de teléfono para guardar en base de datos
 * @param {string} phone - Número de teléfono
 * @returns {string} - Número limpio
 */
export const cleanPhoneForStorage = (phone) => {
  return phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
};
