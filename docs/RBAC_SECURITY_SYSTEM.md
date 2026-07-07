# Sistema de Seguridad RBAC - TurnosAR

## Triángulo de Seguridad

El sistema implementa un modelo de seguridad basado en tres niveles fundamentales:

### 1. Identidad (Autenticación JWT)
- **JWT (JSON Web Tokens)**: Tokens firmados digitalmente que identifican al usuario
- **Payload del token**: Contiene `id`, `role` y timestamps
- **Expiración**: 8 horas por defecto
- **Almacenamiento**: Tokens guardados en localStorage del cliente

```json
{
  "id": 125,
  "role": "patient", // o "professional"
  "iat": 1714068000,
  "exp": 1714096800
}
```

### 2. Rol (Autorización Basada en Roles)
- **Paciente**: Puede gestionar sus propios datos y turnos
- **Profesional**: Puede ver estadísticas, todos los pacientes y todos los turnos
- **Escalabilidad**: Sistema flexible para agregar nuevos roles (admin, recepcionista, etc.)

### 3. Autorización (Permisos y Dueño de Recurso)
- **Principio de Menor Privilegio**: Cada usuario tiene solo el acceso mínimo necesario
- **Validación de Dueño de Recurso**: Un paciente solo puede acceder a sus propios datos
- **Protección de PII**: Datos médicos privados accesibles solo por el paciente y su médico asignado

---

## Implementación Backend

### Middleware de Autenticación (`server/middleware/authMiddleware.js`)

#### `authenticateToken`
Verifica que el token JWT sea válido y extrae la información del usuario.

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. No se proporcionó token.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Por favor, inicie sesión nuevamente.' 
      });
    }
    return res.status(403).json({ 
      error: 'Token inválido.' 
    });
  }
};
```

#### `authorize(roles)`
Middleware flexible para verificar roles específicos.

```javascript
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado: No tienes los permisos necesarios.' 
      });
    }

    next();
  };
};
```

#### `requireOwnership(getResourceOwnerId)`
Middleware para validar que el usuario es dueño del recurso (Nivel Pro).

```javascript
const requireOwnership = (getResourceOwnerId) => {
  return (req, res, next) => {
    const resourceOwnerId = getResourceOwnerId(req);
    const userId = req.user.id;

    if (req.user.role === 'professional') {
      // Los profesionales pueden ver todos los recursos
      return next();
    }

    if (parseInt(resourceOwnerId) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para acceder a este recurso.' 
      });
    }

    next();
  };
};
```

### Aplicación en Rutas (`server/index.js`)

#### Endpoints Públicos (Sin autenticación)
```javascript
app.post('/api/register', registerProfessional);
app.post('/api/login', loginProfessional);
app.post('/api/patient-register', registerPatient);
app.post('/api/patient-login', loginPatient);
app.post('/api/forgot-password', forgotPassword);
app.post('/api/reset-password/:token', resetPassword);
app.get('/api/health', healthCheck);
```

#### Endpoints Protegidos por Rol
```javascript
// Solo profesionales
app.put('/api/professional-change-password/:id', authenticateToken, authorize(['professional']), changeProfessionalPassword);
app.get('/api/pacientes', authenticateToken, authorize(['professional']), getAllPatients);
app.get('/api/turnos', authenticateToken, authorize(['professional']), getAllAppointments);
app.get('/api/stats', authenticateToken, authorize(['professional']), getStats);

// Solo pacientes
app.put('/api/patient-change-password/:id', authenticateToken, authorize(['patient']), changePatientPassword);
app.put('/api/patient/:id', authenticateToken, authorize(['patient']), updatePatient);
app.get('/api/patient/:id', authenticateToken, authorize(['patient']), getPatient);
app.get('/api/turnos/paciente/:id', authenticateToken, authorize(['patient']), getAppointmentsByPatient);

// Ambos roles
app.post('/api/turnos', authenticateToken, authorize(['patient', 'professional']), createAppointment);
```

### Validación de Dueño de Recurso en Controladores

#### Ejemplo en `patientController.js`
```javascript
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ID del usuario autenticado desde JWT
    
    // Validación de propiedad: un paciente solo puede actualizar sus propios datos
    if (req.user.role === 'patient' && parseInt(id) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para actualizar los datos de otro paciente.' 
      });
    }
    
    // ... resto de la lógica
  }
};
```

#### Ejemplo en `appointmentController.js`
```javascript
const getAppointmentsByPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validación de propiedad: un paciente solo puede ver sus propios turnos
    if (req.user.role === 'patient' && parseInt(id) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado a ver los turnos de otro paciente.' 
      });
    }
    
    // ... resto de la lógica
  }
};
```

---

## Implementación Frontend

### Interceptor Axios (`client/src/api/axiosInstance.js`)

Configuración para enviar automáticamente el token en cada request:

```javascript
backendAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
backendAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/patient-login';
    }
    return Promise.reject(error);
  }
);
```

### Componente ProtectedRoute (`client/src/components/ProtectedRoute.jsx`)

Componente para proteger rutas según el rol del usuario:

```javascript
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/patient-login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.isPatient ? 'patient' : 'professional';
    
    if (!allowedRoles.includes(userRole)) {
      if (userRole === 'patient') {
        return <Navigate to="/patient-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};
```

### Menú Condicional por Rol (`client/src/components/Layout.jsx`)

```javascript
{/* Menú condicional por rol */}
{user && user.isPatient && (
  <NavLink to="/patient-dashboard">
    Mis Turnos
  </NavLink>
)}

{user && !user.isPatient && (
  <>
    <NavLink to="/dashboard">
      Estadísticas
    </NavLink>
    <NavLink to="/turnos">
      Todos los Turnos
    </NavLink>
  </>
)}
```

### Almacenamiento de Token en Login

```javascript
// Guardar token JWT en localStorage
if (loginResponse.token) {
  localStorage.setItem('token', loginResponse.token);
}
```

---

## Características de Seguridad

### 1. Principio de Menor Privilegio
- Cada usuario tiene solo el acceso mínimo necesario para su función
- Los pacientes solo ven sus propios datos
- Los profesionales tienen acceso administrativo limitado

### 2. Protección de PII (Personally Identifiable Information)
- Implementación de filtros para que los datos médicos sean privados
- Solo accesibles por el paciente y su médico asignado
- Validación de dueño de recurso en cada endpoint sensible

### 3. Escalabilidad
- El sistema permite agregar nuevos roles (ej. admin, recepcionista) en segundos
- Middleware flexible `authorize(['role1', 'role2'])`
- Sin necesidad de cambiar la lógica principal

### 4. Seguridad en Múltiples Capas
- **Frontend**: UX segura con rutas protegidas y menús condicionales
- **Backend**: Validación real de permisos (no confiar en el frontend)
- **Base de Datos**: Validaciones adicionales en controladores

---

## Flujo Completo de Autenticación

### 1. Login
```
Usuario → Frontend → Backend (login) 
→ Generar JWT Token 
→ Respuesta con token 
→ Guardar en localStorage
```

### 2. Request Protegido
```
Frontend → Interceptor Axios (agrega token) 
→ Backend (authenticateToken) 
→ Validar token 
→ Backend (authorize) 
→ Validar rol 
→ Backend (requireOwnership) 
→ Validar dueño de recurso 
→ Controlador 
→ Respuesta
```

### 3. Error de Autenticación
```
Token inválido/expirado → Backend (401) 
→ Interceptor Axios (detecta 401) 
→ Limpiar localStorage 
→ Redirigir a login
```

---

## Variables de Entorno

```env
# .env.example
JWT_SECRET=your-secret-key-change-this-in-production
BCRYPT_SALT_ROUNDS=10
```

---

## Mejores Prácticas Implementadas

1. **Nunca confiar en el frontend**: La seguridad real está en el backend
2. **Validación en múltiples capas**: JWT + Rol + Dueño de Recurso
3. **Tokens con expiración**: 8 horas por defecto
4. **Manejo de errores 401**: Redirección automática a login
5. **Separación de responsabilidades**: Middleware específico para cada función
6. **Documentación clara**: Comentarios y Swagger para cada endpoint
7. **Escalabilidad**: Sistema preparado para agregar nuevos roles

---

## Próximos Pasos

1. Agregar rol `admin` para gestión completa del sistema
2. Implementar refresh tokens para mejor UX
3. Agregar rate limiting para prevenir ataques de fuerza bruta
4. Implementar logs de auditoría para acciones sensibles
5. Agregar 2FA (Two-Factor Authentication) para roles críticos

---

## Puntos Clave para el Portfolio

- **Arquitectura de Seguridad en Múltiples Capas**: JWT + RBAC + Dueño de Recurso
- **Principio de Menor Privilegio**: Implementación real en cada endpoint
- **Protección de PII**: Datos médicos privados con validaciones estrictas
- **Escalabilidad**: Sistema flexible para agregar nuevos roles sin refactorización
- **Seguridad Real en Backend**: No confiar en el frontend para validaciones críticas
- **Experiencia de Usuario**: Redirección automática y manejo de errores transparente
