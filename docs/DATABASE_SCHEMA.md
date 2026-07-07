# Esquema de Base de Datos

## Descripción

Este documento describe el esquema de base de datos de TurnosAR, implementado en PostgreSQL con normalización 3NF e integridad referencial.

## Single Source of Truth

La estructura de la base de datos se define en `server/database/structure.sql`. Este archivo es la única fuente de verdad para el esquema y permite recrear entornos idénticos (desarrollo, test, producción).

## Tablas Principales

### pacientes

Almacena la información de los pacientes del sistema.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único autoincremental |
| dni | VARCHAR(20) | UNIQUE, NOT NULL | Documento Nacional de Identidad (único) |
| nombre | VARCHAR(255) | NOT NULL | Nombre completo del paciente |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico (único) |
| telefono | VARCHAR(20) | NOT NULL | Teléfono (formato internacional +54) |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

**Índices:**
- `idx_pacientes_dni` en columna `dni` (para búsquedas rápidas)
- `idx_pacientes_email` en columna `email` (para búsquedas rápidas)

### profesionales

Almacena la información de los profesionales de la salud.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único autoincremental |
| nombre | VARCHAR(255) | UNIQUE, NOT NULL | Nombre completo del profesional |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico (único) |
| cuit | VARCHAR(20) | UNIQUE, NOT NULL | CUIT/CUIL del profesional (único) |
| especialidad | VARCHAR(100) | NOT NULL | Especialidad médica |
| clinica | VARCHAR(255) | NOT NULL | Nombre de la clínica o consultorio |
| telefono | VARCHAR(20) | NOT NULL | Teléfono de contacto |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

**Índices:**
- `idx_profesionales_nombre` en columna `nombre` (para búsquedas rápidas)
- `idx_profesionales_cuit` en columna `cuit` (para validaciones AFIP)

### turnos

Almacena la información de los turnos médicos con datos de facturación integrados y sistema de seña para obra social.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único autoincremental |
| paciente_id | INTEGER | FOREIGN KEY → pacientes(id) ON DELETE CASCADE | ID del paciente |
| paciente_dni | VARCHAR(20) | NOT NULL | DNI del paciente (redundancia para queries) |
| paciente_nombre | VARCHAR(255) | NOT NULL | Nombre del paciente (redundancia para queries) |
| paciente_email | VARCHAR(255) | NOT NULL | Email del paciente (redundancia para queries) |
| paciente_telefono | VARCHAR(20) | NOT NULL | Teléfono del paciente (redundancia para queries) |
| provincia | VARCHAR(100) | NOT NULL | Provincia del turno |
| clinica | VARCHAR(255) | NOT NULL | Clínica del turno |
| especialidad | VARCHAR(100) | NOT NULL | Especialidad del turno |
| profesional | VARCHAR(255) | NOT NULL | Nombre del profesional |
| fecha | DATE | NOT NULL | Fecha del turno |
| hora | TIME | NOT NULL | Hora del turno |
| estado | VARCHAR(20) | NOT NULL | Estado: confirmado, completado, cancelado |
| precio_consulta | DECIMAL(10,2) | DEFAULT 30000.00 | Precio de la consulta |
| facturado | BOOLEAN | DEFAULT FALSE | Indica si tiene comprobante fiscal |
| cae_number | VARCHAR(20) | NULL | Código de Autorización Electrónico (AFIP) |
| cae_vencimiento | DATE | NULL | Fecha de vencimiento del CAE |
| factura_url | VARCHAR(500) | NULL | URL del comprobante fiscal |
| tipo_comprobante | VARCHAR(50) | NULL | Tipo: FACTURA_C, NOTA_CREDITO_C |
| monto_facturado | DECIMAL(10,2) | NULL | Monto facturado |
| fecha_facturacion | TIMESTAMP | NULL | Fecha de generación del comprobante |
| fecha_cancelacion | TIMESTAMP | NULL | Fecha de cancelación (para cálculo de penalidades) |
| **Campos de Seña Obra Social** |
| tipo_cobertura | VARCHAR(20) | NULL | Tipo de cobertura: 'particular', 'obra_social' |
| nro_afiliado | VARCHAR(50) | NULL | Número de afiliado a obra social |
| estado_validacion | VARCHAR(20) | NULL | Estado de validación: 'pendiente', 'validado', 'rechazado' |
| monto_sena | DECIMAL(10,2) | NULL | Monto de la seña (ej: 10000.00) |
| status_sena | VARCHAR(20) | NULL | Estado de la seña: 'cobrada', 'reintegrada', 'retenida' |
| mercado_pago_id | VARCHAR(100) | NULL | ID del pago en Mercado Pago |
| token_validacion | VARCHAR(6) | NULL | Token de 6 dígitos validado en recepción |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Índices:**
- `idx_turnos_profesional_fecha` en columnas `profesional, fecha` (para estadísticas)
- `idx_turnos_paciente_id` en columna `paciente_id` (para consultas de pacientes)
- `idx_turnos_estado` en columna `estado` (para filtros por estado)

### refresh_tokens

Almacena los refresh tokens para renovación silenciosa de sesiones (Silent Refresh).

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PRIMARY KEY | Identificador único autoincremental |
| user_id | INTEGER | FOREIGN KEY → pacientes(id) ON DELETE CASCADE | ID del usuario (paciente) |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Token de refresh (hash seguro de 128 caracteres) |
| expires_at | TIMESTAMP | NOT NULL | Fecha de expiración del refresh token (7 días) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| revoked_at | TIMESTAMP | NULL | Fecha en que el token fue revocado (logout) |

**Índices:**
- `idx_refresh_tokens_token` en columna `token` (búsquedas rápidas)
- `idx_refresh_tokens_expires_at` en columna `expires_at` (limpieza de tokens expirados)

## Relaciones

### Diagrama ER Actualizado

```
profesionales (1) ────── (N) turnos ────── (1) pacientes
    |                                              |
    |                                              |
  tiene                                        tiene
    |                                              |
    └──────────────────────────────────────────────┘
                          |
                          |
                   refresh_tokens
                          |
                   (1) ──── (N)
                          |
                      pacientes
```

**Nuevas Relaciones:**
- `refresh_tokens.user_id` → `pacientes.id` (CASCADE DELETE)
- Tokens de refresh asociados a pacientes para renovación silenciosa

### Reglas de Integridad

- **CASCADE DELETE**: Si se elimina un paciente, se eliminan todos sus turnos
- **UNIQUE Constraints**: DNI, email y CUIT son únicos para evitar duplicados
- **NOT NULL**: Campos críticos no pueden ser nulos
- **DEFAULT VALUES**: Valores por defecto para campos opcionales

## Decisiones de Diseño Senior

### Normalización 3NF
- Los datos están estructurados para evitar redundancia
- Cada tabla tiene un propósito único
- Las relaciones están normalizadas

### Redundancia Controlada
- Algunos campos del paciente en `turnos` (dni, nombre, email, telefono)
- **Justificación**: Mejora rendimiento en queries de estadísticas
- **Trade-off**: Espacio adicional por velocidad de queries

### Tipado Estricto
- `VARCHAR(20)` para teléfonos (soporte internacional +54)
- `DECIMAL(10,2)` para montos monetarios (precisión financiera)
- `BOOLEAN` para estados binarios (facturado)

### Integridad Referencial
- FOREIGN KEY con CASCADE DELETE para evitar datos huérfanos
- UNIQUE constraints para evitar duplicados críticos

## Migraciones

### Migration 001: Estructura Base

```bash
psql -U tu_usuario -d tu_base_de_datos -f server/database/structure.sql
```

### Migration 002: Sistema de Facturación

```sql
-- Campos para facturación AFIP
ALTER TABLE turnos 
ADD COLUMN facturado BOOLEAN DEFAULT FALSE,
ADD COLUMN cae_number VARCHAR(20),
ADD COLUMN cae_vencimiento DATE,
ADD COLUMN factura_url VARCHAR(500),
ADD COLUMN tipo_comprobante VARCHAR(50),
ADD COLUMN monto_facturado DECIMAL(10,2),
ADD COLUMN fecha_facturacion TIMESTAMP;
```

### Migration 003: Sistema de Seña Obra Social

```sql
-- Campos para seña de obra social
ALTER TABLE turnos 
ADD COLUMN tipo_cobertura VARCHAR(20),
ADD COLUMN nro_afiliado VARCHAR(50),
ADD COLUMN estado_validacion VARCHAR(20),
ADD COLUMN monto_sena DECIMAL(10,2),
ADD COLUMN status_sena VARCHAR(20),
ADD COLUMN mercado_pago_id VARCHAR(100),
ADD COLUMN token_validacion VARCHAR(6);

-- Comentarios para documentación
COMMENT ON COLUMN turnos.tipo_cobertura IS 'Tipo de cobertura: particular, obra_social';
COMMENT ON COLUMN turnos.monto_sena IS 'Monto de seña para obra social (ej: 10000.00)';
COMMENT ON COLUMN turnos.status_sena IS 'Estado de la seña: cobrada, reintegrada, retenida';
```

### Migration 004: Silent Refresh Tokens

```sql
-- Tabla para refresh tokens seguros
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

-- Índices para rendimiento
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Comentarios
COMMENT ON TABLE refresh_tokens IS 'Almacena refresh tokens seguros para renovación de sesiones';
COMMENT ON COLUMN refresh_tokens.token IS 'Token de refresh (hash seguro de 128 caracteres)';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Fecha de expiración (generalmente 7 días)';
```

### Ejecutar Todas las Migraciones

```bash
# En orden secuencial
psql -U postgres -d turnos_medicos_db -f server/database/migrations/001_structure.sql
psql -U postgres -d turnos_medicos_db -f server/database/migrations/002_billing.sql
psql -U postgres -d turnos_medicos_db -f server/database/migrations/003_add_obra_social_columns.sql
psql -U postgres -d turnos_medicos_db -f server/database/migrations/004_create_refresh_tokens.sql
```

### Backup de Base de Datos

```bash
# Backup completo
pg_dump -U tu_usuario -d turnosar > backup.sql

# Restaurar backup
psql -U tu_usuario -d turnosar < backup.sql
```

## Seguridad de Datos

### ⚠️ Datos Sensibles
- `password_hash` en pacientes y profesionales (bcrypt)
- `dni` en pacientes (datos personales)
- `cuit` en profesionales (datos fiscales)
- `cae_number` y datos de facturación (datos financieros)

### ✅ Protecciones Implementadas
- Hash de contraseñas con bcrypt (SALT_ROUNDS=10)
- No almacenamiento de contraseñas en texto plano
- Acceso restringido por JWT
- Queries parametrizadas para evitar SQL injection

## Consideraciones de Rendimiento

### Índices Estratégicos
- Índices en columnas frecuentemente usadas en WHERE
- Índices compuestos para queries de estadísticas
- UNIQUE constraints también crean índices automáticamente

### Optimización de Queries
- Usar EXPLAIN ANALYZE para analizar rendimiento
- Evitar SELECT * en columnas grandes
- Usar JOINs eficientes con FOREIGN KEYs

## Limitaciones

- El esquema actual soporta un solo profesional por turno
- No hay soporte para turnos recurrentes (future enhancement)
- No hay historial de cambios de estado (future enhancement)
