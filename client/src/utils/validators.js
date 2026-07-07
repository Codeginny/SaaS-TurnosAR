// Utilidades de validación para el frontend
// Funciones reutilizables para validar DNI, contraseñas, etc.

// Función para validar formato de DNI
export const validarFormatoDNI = (dni) => {
  // Verificar que sea un número de 7-8 dígitos
  const dniString = dni.toString();
  
  // Debe tener 7 u 8 dígitos
  if (dniString.length < 7 || dniString.length > 8) {
    return {
      valido: false,
      error: "El DNI debe tener 7 u 8 dígitos"
    };
  }
  
  // Solo debe contener números
  if (!/^\d{7,8}$/.test(dniString)) {
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
