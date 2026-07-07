# Post-Mortem: Error de Columnas Timestamp en PostgreSQL

**Fecha:** 2025-04-25  
**Severidad:** Alta (Error 500 - Registro de profesionales bloqueado)  
**Estado:** Resuelto

---

## Resumen Ejecutivo

El sistema no permitía registrar profesionales debido a un Error 500. El backend intentaba insertar datos en columnas (`created_at`, `updated_at`) que no existían en la base de datos PostgreSQL, causando que la transacción fallara.

---

## Síntomas

### Error Observado
```
Error en registro de profesional: error: column "created_at" does not exist
```

### Impacto
- **Usuarios afectados:** Todos los intentos de registro de profesionales
- **Funcionalidad bloqueada:** Registro de nuevos profesionales
- **Error HTTP:** 500 Internal Server Error
- **Mensajes de usuario:** "Error en el registro. Intenta nuevamente."

### Logs del Servidor
```javascript
Error en registro de profesional: error: column "createdat" does not exist
    at /home/codeginny/Projects/Sistema-TurnosAR/server/node_modules/pg-pool/index.js:45:11
```

---

## Análisis de la Causa Raíz

### Causa Principal
**Inconsistencia entre esquema de base de datos y código del backend:**

1. **Código del backend** (`server/index.js`):
   - Usaba nombres de columnas incorrectos: `createdat`, `updatedat` (sin guiones bajos)
   - En ~10 consultas SQL (INSERT, SELECT, UPDATE)

2. **Base de datos PostgreSQL**:
   - Las columnas se llamaban `created_at`, `updated_at` (con guiones bajos)
   - O en algunos casos, las columnas directamente no existían

3. **Archivo de configuración**:
   - Contraseña incorrecta: `codeginny` vs `admin123`
   - Nombre de base de datos: `turnosar_db` vs `turnos_medicos_db`

### Diagrama del Problema
```
Frontend → API POST /api/register → Backend (server/index.js)
                                            ↓
                                   INSERT INTO profesionales (... createdat ...)
                                            ↓
                            PostgreSQL: ❌ column "createdat" does not exist
                                            ↓
                                   Error 500 al cliente
```

---

## Línea de Tiempo

| Hora | Evento |
|------|--------|
| 14:30 | Usuario reporta error al registrar profesional |
| 14:31 | Diagnóstico: Error 500 en logs del servidor |
| 14:32 | Identificación: column "createdat" does not exist |
| 14:35 | Corrección 1: Cambiar `createdat` → `created_at` en backend |
| 14:40 | Corrección 2: Cambiar `updatedat` → `updated_at` en backend |
| 14:42 | Corrección 3: Actualizar contraseña en config.js |
| 14:43 | Corrección 4: Verificar nombre de base de datos |
| 14:45 | Usuario ejecuta comandos SQL para crear columnas |
| 14:50 | Sistema operativo y funcionando |

---

## Solución Implementada

### 1. Corrección de Nombres de Columnas en Backend

**Archivo:** `server/index.js`

```javascript
// ❌ Antes (incorrecto)
RETURNING id, nombre, email, telefono, especialidad, createdat

// ✅ Después (correcto)
RETURNING id, nombre, email, telefono, especialidad, created_at
```

**Cambios:** ~10 instancias reemplazadas globalmente

### 2. Actualización de Credenciales de PostgreSQL

**Archivo:** `server/database/config.js`

```javascript
// ❌ Antes
database: 'turnos_medicos_db',
password: 'codeginny',

// ✅ Después
database: 'turnos_medicos_db',
password: 'admin123',
```

### 3. Creación de Columnas en PostgreSQL

**Comandos SQL ejecutados por usuario:**
```sql
ALTER TABLE profesionales ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profesionales ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE pacientes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE pacientes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### 4. Implementación de Variables de Entorno

**Archivo:** `server/database/config.js`

```javascript
// ✅ Implementado
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'turnos_medicos_db',
  // ...
});
```

**Archivo creado:** `server/.env.example` (para documentación)

---

## Lecciones Aprendidas

### Técnicas
1. **Naming consistency:** PostgreSQL usa `snake_case`, JavaScript usa `camelCase`. El backend debe normalizar entre ambos.
2. **Database-first approach:** La estructura de la base de datos es la fuente de verdad. El código debe adaptarse a ella.
3. **Environment variables:** Nunca hardcodear credenciales en código fuente.

### Proceso
1. **Early detection:** Validar esquema de base de datos antes de implementar cambios en código.
2. **Documentation:** Mantener actualizada la documentación de estructura de tablas.
3. **Testing:** Unit tests hubieran detectado este error antes de producción.

---

## Prevención Futura

### Inmediato
- [x] Agregar validación de esquema al inicio del servidor
- [x] Implementar variables de entorno (.env)
- [x] Documentar estructura de base de datos

### Corto Plazo
- [ ] Implementar tests unitarios para endpoints de registro
- [ ] Agregar migraciones automáticas de base de datos
- [ ] Configurar CI/CD para validar esquema

### Largo Plazo
- [ ] Implementar ORM (Prisma/Sequelize) para consistencia automática
- [ ] Agregar health check que valide estructura de tablas
- [ ] Documentación de API con Swagger

---

## Referencias

- **Archivos modificados:**
  - `server/database/config.js`
  - `server/index.js`
  - `server/.env.example` (nuevo)

- **Comandos SQL utilizados:**
  - `ALTER TABLE profesionales ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `ALTER TABLE profesionales ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

- **Errores relacionados:**
  - Error de autenticación PostgreSQL (password incorrecto)
  - Error de keys duplicadas en Dashboard.jsx (resuelto en paralelo)

---

**Reportado por:** Virginia Ponce (Codeginny)  
**Revisado por:** -  
**Aprobado por:** -
