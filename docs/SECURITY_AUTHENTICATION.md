# Sistema de Seguridad y Autenticación

Este documento describe el sistema completo de seguridad y autenticación implementado en Medsmart, incluyendo la innovadora arquitectura de Silent Refresh que elimina las interrupciones por sesión expirada.

## Tabla de Contenidos

- [Silent Refresh (Refresh Tokens de Nivel Elite)](#silent-refresh-refresh-tokens-de-nivel-elite)
  - [Arquitectura de Doble Token](#arquitectura-de-doble-token)
  - [Flujo de Renovación Silenciosa](#flujo-de-renovación-silenciosa)
  - [Endpoint de Refresh](#endpoint-de-refresh)
  - [Seguridad Implementada](#seguridad-implementada)
  - [Código Clave](#código-clave)
- [Roles de Usuario](#roles-de-usuario)
- [Implementación Técnica](#implementación-técnica)
- [Testing de Seguridad](#testing-de-seguridad)
- [Monitoreo y Auditoría](#monitoreo-y-auditoría)

## Silent Refresh (Refresh Tokens de Nivel Elite)

Implementamos una arquitectura de doble token que elimina completamente los mensajes de "Sesión Expirada" para el usuario final.

### Arquitectura de Doble Token

#### Access Token (15 minutos)

- **Se envía en el body JSON del login**
- **Se usa en el header `Authorization: Bearer <token>`**
- **Corta duración para minimizar riesgo de exposición**

#### Refresh Token (7 días)

- **Se almacena en cookie `httpOnly` (inaccesible desde JavaScript)**
- **Configuración segura**: `secure`, `sameSite: 'strict'`
- **Se usa automáticamente para renovar el access token**

### Flujo de Renovación Silenciosa

1. **Login**: Backend emite ambos tokens
2. **Request normal**: Frontend usa access token
3. **Error 401**: Axios interceptor detecta token expirado
4. **Auto-refresh**: Llama a `/api/refresh-token` con cookie
5. **Reintento**: Reintenta la petición original con nuevo token
6. **UX transparente**: El usuario nunca nota la renovación

### Endpoint de Refresh

```http
POST /api/refresh-token
Cookie: refreshToken=<token_httpOnly>
Response: { "token": "nuevo_access_token_jwt" }
```

### Seguridad Implementada

- **Protección XSS**: Refresh token en cookie `httpOnly`
- **Rotación de tokens**: Cada refresh genera un nuevo token
- **Revocación automática**: Tokens anteriores se marcan como revocados
- **Manejo de cola**: Evita múltiples refresh simultáneos
- **Fallback seguro**: Si refresh falla, redirige al login

### Código Clave

#### Backend (authController.js)

```javascript
// Login: Generar ambos tokens
const accessToken = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '15m' });
const refreshToken = crypto.randomBytes(64).toString('hex');

// Cookie HttpOnly segura
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

#### Frontend (axiosInstance.js)

```javascript
// Interceptor inteligente
backendAPI.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      const response = await backendAPI.post('/refresh-token');
      originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
      return backendAPI(originalRequest); // Reintentar
    }
    return Promise.reject(error);
  }
);
```

## Roles de Usuario

- **Paciente**: Acceso a sus propios turnos y datos personales
- **Profesional**: Acceso a dashboard, estadísticas y facturación
- **JWT**: Access tokens con 15 minutos de vida
- **bcrypt**: Hash de contraseñas con SALT_ROUNDS=10

## Implementación Técnica

### Middleware de Autenticación

```javascript
// authMiddleware.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};
```

### Manejo de Refresh Tokens

```javascript
// refreshController.js
const refreshTokens = new Map(); // En producción, usar Redis

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const storeRefreshToken = (userId, refreshToken) => {
  refreshTokens.set(refreshToken, {
    userId,
    createdAt: Date.now(),
    revoked: false
  });
};

const revokeRefreshToken = (refreshToken) => {
  const tokenData = refreshTokens.get(refreshToken);
  if (tokenData) {
    tokenData.revoked = true;
  }
};
```

### Configuración de Cookies Seguras

```javascript
const setSecureCookie = (res, name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  };

  res.cookie(name, value, { ...defaultOptions, ...options });
};
```

## Testing de Seguridad

### Tests de Autenticación

```javascript
describe('Sistema de Autenticación', () => {
  test('debe generar access token y refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/login/patient')
      .send({ dni: '12345678', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
    
    const cookies = response.headers['set-cookie'];
    const refreshCookie = cookies.find(cookie => 
      cookie.startsWith('refreshToken=')
    );
    expect(refreshCookie).toContain('HttpOnly');
  });

  test('debe renovar token automáticamente', async () => {
    // 1. Login inicial
    const loginResponse = await loginUser();
    const accessToken = loginResponse.body.token;

    // 2. Simular token expirado
    jwt.verify(accessToken, process.env.JWT_SECRET, { ignoreExpiration: true });

    // 3. Petición con token expirado (debe renovarse automáticamente)
    const response = await request(app)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', loginResponse.headers['set-cookie']);

    expect(response.status).toBe(200);
  });
});
```

### Tests de Seguridad

```javascript
describe('Seguridad de Tokens', () => {
  test('refresh token debe ser inaccesible desde JavaScript', () => {
    const res = {
      cookie: jest.fn()
    };

    setSecureCookie(res, 'refreshToken', 'token123');
    
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'token123',
      expect.objectContaining({ httpOnly: true })
    );
  });

  test('debe revocar tokens anteriores al generar nuevos', async () => {
    const userId = 123;
    const oldToken = generateRefreshToken();
    
    storeRefreshToken(userId, oldToken);
    
    // Generar nuevo token
    const newToken = await refreshAccessToken(oldToken);
    
    // Verificar que el antiguo fue revocado
    const oldTokenData = refreshTokens.get(oldToken);
    expect(oldTokenData.revoked).toBe(true);
  });
});
```

## Monitoreo y Auditoría

### Logging de Eventos de Seguridad

```javascript
const securityLogger = {
  login: (userId, ip, userAgent) => {
    console.log({
      timestamp: new Date().toISOString(),
      event: 'LOGIN_SUCCESS',
      userId,
      ip,
      userAgent
    });
  },

  tokenRefresh: (userId, oldTokenId, newTokenId) => {
    console.log({
      timestamp: new Date().toISOString(),
      event: 'TOKEN_REFRESH',
      userId,
      oldTokenId,
      newTokenId
    });
  },

  failedAuth: (reason, ip, userAgent) => {
    console.log({
      timestamp: new Date().toISOString(),
      event: 'AUTH_FAILED',
      reason,
      ip,
      userAgent
    });
  }
};
```

### Alertas de Seguridad

```javascript
const securityAlerts = {
  detectBruteForce: (ip, attempts) => {
    if (attempts > 5) {
      // Bloquear IP temporalmente
      blockIP(ip, 15 * 60 * 1000); // 15 minutos
      securityLogger.failedAuth('BRUTE_FORCE', ip);
    }
  },

  detectSuspiciousActivity: (userId, activity) => {
    // Detectar cambios de ubicación geográfica
    // Múltiples dispositivos simultáneos
    // Patrones de uso anómalos
  }
};
```

## Configuración de Producción

### Variables de Entorno

```bash
# JWT Configuration
JWT_SECRET=super_secret_key_256_bits_minimum
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cookie Security
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración de CORS

```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true, // Permite cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Mejores Prácticas de Seguridad

### 1. Gestión de Secretos

```javascript
// Nunca hardcodear secrets
const config = {
  jwtSecret: process.env.JWT_SECRET,
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
};

// Rotación de secrets
if (isProduction() && !config.jwtSecret) {
  throw new Error('JWT_SECRET es requerido en producción');
}
```

### 2. Validación de Entrada

```javascript
const validateLoginInput = (req, res, next) => {
  const { dni, password } = req.body;
  
  // Sanitización básica
  const sanitizedDni = dni?.trim().replace(/[^\d]/g, '');
  const sanitizedPassword = password?.trim();
  
  if (!sanitizedDni || !sanitizedPassword) {
    return res.status(400).json({ 
      error: 'DNI y contraseña son requeridos' 
    });
  }
  
  req.body.dni = sanitizedDni;
  req.body.password = sanitizedPassword;
  next();
};
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
```

## Manejo de Casos Extremos

### 1. Token Theft Detection

```javascript
const detectTokenTheft = (userId, ip, userAgent) => {
  const lastActivity = getLastUserActivity(userId);
  
  if (lastActivity) {
    const timeDiff = Date.now() - lastActivity.timestamp;
    const ipChanged = lastActivity.ip !== ip;
    const userAgentChanged = lastActivity.userAgent !== userAgent;
    
    // Si hay cambios sospechosos en poco tiempo
    if (timeDiff < 60000 && (ipChanged || userAgentChanged)) {
      // Revocar todos los tokens del usuario
      revokeAllUserTokens(userId);
      sendSecurityAlert(userId, 'SUSPICIOUS_ACTIVITY');
      return true;
    }
  }
  
  return false;
};
```

### 2. Session Hijacking Prevention

```javascript
const sessionSecurity = {
  // Validar fingerprint del navegador
  validateFingerprint: (req, res, next) => {
    const fingerprint = req.headers['x-browser-fingerprint'];
    const storedFingerprint = req.user.fingerprint;
    
    if (fingerprint !== storedFingerprint) {
      revokeAllUserTokens(req.user.id);
      return res.status(401).json({ error: 'Sesión inválida' });
    }
    
    next();
  },
  
  // Detectar concurrent sessions
  detectConcurrentSessions: (userId) => {
    const activeSessions = getActiveSessions(userId);
    if (activeSessions.length > 3) {
      // Mantener solo las 3 más recientes
      revokeOldestSessions(userId, activeSessions.length - 3);
    }
  }
};
```

## Rendimiento y Escalabilidad

### Optimización de Token Storage

```javascript
// Usar Redis para producción
const redis = require('redis');
const client = redis.createClient();

const tokenStorage = {
  async storeRefreshToken(userId, token) {
    await client.setex(`refresh:${token}`, 7 * 24 * 60 * 60, userId);
  },
  
  async getUserIdFromToken(token) {
    return await client.get(`refresh:${token}`);
  },
  
  async revokeToken(token) {
    await client.del(`refresh:${token}`);
  }
};
```

### Caching de Validaciones

```javascript
const NodeCache = require('node-cache');
const tokenCache = new NodeCache({ stdTTL: 600 }); // 10 minutos

const cachedTokenValidation = (token) => {
  const cacheKey = `valid:${token}`;
  let isValid = tokenCache.get(cacheKey);
  
  if (isValid === undefined) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      isValid = true;
      tokenCache.set(cacheKey, isValid);
    } catch (error) {
      isValid = false;
    }
  }
  
  return isValid;
};
```

Este sistema de seguridad proporciona una experiencia de usuario sin interrupciones mientras mantiene los más altos estándares de seguridad y protección de datos médicos sensibles.
