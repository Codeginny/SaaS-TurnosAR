# Manejo de Errores y Validaciones Mejoradas

Este documento describe el sistema completo de manejo de errores y validaciones implementado en la aplicación Medsmart.

## Tabla de Contenidos

- [Validaciones de Frontend](#validaciones-de-frontend)
  - [Validaciones de Perfil](#validaciones-de-perfil)
  - [Validaciones de Turno](#validaciones-de-turno)
- [Manejo de Errores de Backend](#manejo-de-errores-de-backend)
  - [Validaciones con Zod](#validaciones-con-zod)
  - [Centralización de Errores](#centralización-de-errores)
- [Mensajes de Error User-Friendly](#mensajes-de-error-user-friendly)
- [Feedback Visual](#feedback-visual)
- [Mejores Prácticas](#mejores-prácticas)

## Validaciones de Frontend

### Validaciones de Perfil

Las validaciones de perfil aseguran que los datos del usuario sean correctos antes de ser enviados al servidor.

```javascript
const validateUserData = () => {
  const errors = {};
  
  // Validación de nombre con regex estricta
  const nombreValue = userData.nombre || user?.nombre || '';
  if (!nombreValue.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreValue.trim())) {
    errors.nombre = 'El nombre solo puede contener letras y espacios';
  }
  
  // Validación de DNI con formato argentino
  const dniString = String(userData.dni || user?.dni || '');
  if (!dniString.trim()) {
    errors.dni = 'El DNI es obligatorio';
  } else if (!/^[0-9]{7,8}$/.test(dniString.trim())) {
    errors.dni = 'El DNI debe tener 7 u 8 dígitos numéricos';
  }
  
  // Validación de email con regex robusta
  const emailValue = userData.email || user?.email || '';
  if (!emailValue.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
    errors.email = 'Ingresa un email válido';
  }
  
  return errors;
};
```

### Validaciones de Turno

Las validaciones de turno aseguran que los datos específicos de los turnos médicos sean correctos.

```javascript
const validateTurno = () => {
  const errors = {};
  
  // Validación de afiliado para obra social
  if (formData.tipoCobertura === 'obra_social') {
    if (!formData.nroAfiliado || formData.nroAfiliado.trim() === '') {
      errors.nroAfiliado = 'El número de afiliado es obligatorio';
    } else if (formData.nroAfiliado.trim().length < 5) {
      errors.nroAfiliado = 'El número de afiliado debe tener al menos 5 caracteres';
    }
  }
  
  return errors;
};
```

## Manejo de Errores de Backend

### Validaciones con Zod

Utilizamos Zod para validaciones estrictas en el backend que garantizan la integridad de los datos.

```javascript
// Esquemas de validación estrictos
const loginPatientSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const validateTokenRequestSchema = z.object({
  tokenVivo: z.string().regex(/^\d{6}$/, 'El token debe tener exactamente 6 dígitos')
});
```

### Centralización de Errores

Implementamos un middleware centralizado para manejar todos los errores de manera consistente.

```javascript
// Middleware de manejo de errores
const errorHandler = (error, req, res, next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: error.errors.map(err => ({
        campo: err.path[0],
        mensaje: err.message
      }))
    });
  }
  
  // Errores de base de datos
  if (error.code === '23505') {
    return res.status(409).json({
      error: 'Duplicado',
      mensaje: 'El DNI o email ya está registrado'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor'
  });
};
```

## Mensajes de Error User-Friendly

### Errores Comunes

Todos los mensajes de error están diseñados para ser claros y útiles para el usuario:

✅ **DNI inválido**: "El DNI debe tener 7 u 8 dígitos numéricos"
✅ **Email inválido**: "Ingresa un email válido (ej: usuario@dominio.com)"
✅ **Afiliado requerido**: "El número de afiliado es obligatorio para obra social"
✅ **Token inválido**: "El token debe tener exactamente 6 dígitos"
✅ **Sesión expirada**: "Tu sesión ha expirado. Por favor, ingresa nuevamente."

### Jerarquía de Errores

1. **Errores de Validación (400)**: Datos inválidos o incompletos
2. **Errores de Autenticación (401)**: Credenciales incorrectas
3. **Errores de Autorización (403)**: Permisos insuficientes
4. **Errores de Duplicado (409)**: Recurso ya existe
5. **Errores de Servidor (500)**: Errores internos

## Feedback Visual

### Indicadores de Validación

Implementamos indicadores visuales claros para el estado de cada campo:

```javascript
// Estados de campo
<div className={`border rounded-lg px-4 py-3 ${
  errors.nombre 
    ? 'border-red-500 focus:border-red-600' 
    : value && isValid 
      ? 'border-green-500 focus:border-green-600'
      : 'border-gray-300'
}`}>

// Mensajes de ayuda
{errors.nombre && (
  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
)}
{!errors.nombre && value && isValid && (
  <p className="mt-1 text-sm text-green-600">✅ Válido</p>
)}
```

### Estados Visuales

- **🔴 Rojo**: Error de validación
- **🟢 Verde**: Campo válido
- **⚪ Gris**: Campo sin validar
- **🔵 Azul**: Campo enfocado

## Mejores Prácticas

### 1. Validación en Múltiples Capas

- **Frontend**: Validación inmediata para mejor UX
- **Backend**: Validación estricta para seguridad
- **Base de Datos**: Restricciones para integridad

### 2. Mensajes Consistentes

- Usar lenguaje claro y amigable
- Proporcionar ejemplos cuando sea posible
- Ser específicos sobre el error

### 3. Manejo de Errores Asíncronos

```javascript
try {
  const result = await apiCall();
  setSuccess(true);
} catch (error) {
  if (error.response?.status === 400) {
    setErrors(error.response.data.details);
  } else {
    setGeneralError('Error inesperado. Intente nuevamente.');
  }
}
```

### 4. Logging de Errores

Implementar logging estructurado para debugging:

```javascript
const logError = (error, context) => {
  console.error({
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context,
    userId: user?.id
  });
};
```

### 5. Pruebas de Validación

- Probar casos límite (valores máximos/mínimos)
- Probar caracteres especiales
- Probar valores nulos y undefined
- Probar formatos inválidos

## Flujo de Validación Completo

1. **Usuario ingresa datos**
2. **Validación frontend en tiempo real**
3. **Feedback visual inmediato**
4. **Envío al backend**
5. **Validación backend con Zod**
6. **Respuesta estructurada**
7. **Manejo de errores centralizado**
8. **Actualización de UI según resultado**

## Herramientas Utilizadas

- **Zod**: Validación de esquemas en backend
- **Regex**: Validación de formatos específicos
- **TailwindCSS**: Estilos visuales de validación
- **React Hooks**: Manejo de estado de errores

Este sistema garantiza una experiencia de usuario robusta y segura con validaciones consistentes en toda la aplicación.
