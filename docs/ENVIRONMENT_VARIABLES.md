# Variables de Entorno

## Descripción

Este documento describe las variables de entorno necesarias para configurar y ejecutar TurnosAR. Todas las credenciales deben ser almacenadas de forma segura y nunca deben ser compartidas o versionadas en el control de código.

## Archivo de Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
# ⚠️ IMPORTANTE: Reemplaza estos valores con tus credenciales reales
# Los valores mostrados a continuación son SOLO EJEMPLO
DATABASE_URL=postgresql://usuario:password_ejemplo@localhost:5432/turnosar

# JWT Authentication
# ⚠️ IMPORTANTE: Usa una cadena aleatoria larga y segura en producción
# El valor mostrado a continuación es SOLO EJEMPLO
JWT_SECRET=ejemplo_secreto_jwt_cambiar_en_produccion_usar_cadena_aleatoria_larga
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# AFIP Integration (Opcional - para producción real)
# ⚠️ IMPORTANTE: Estas credenciales deben obtenerse de AFIP
# Los valores mostrados a continuación son SOLO EJEMPLO
AFIP_CUIT=20123456789
AFIP_CERT_PATH=/path/to/certificado.pfx
AFIP_KEY_PATH=/path/to/llave.key
```

## Variables Detalladas

### DATABASE_URL
**Descripción**: URL de conexión a PostgreSQL  
**Formato**: `postgresql://usuario:password@host:puerto/base_datos`  
**Ejemplo**: `postgresql://usuario:password_ejemplo@localhost:5432/turnosar`  
**Seguridad**: Nunca versionar credenciales reales en `.env` o `.env.example`

### JWT_SECRET
**Descripción**: Clave secreta para firmar tokens JWT  
**Requisitos**: Mínimo 32 caracteres, usar caracteres aleatorios  
**Ejemplo**: `ejemplo_secreto_jwt_cambiar_en_produccion_usar_cadena_aleatoria_larga`  
**Generación**: Usa `openssl rand -base64 32` para generar una clave segura  
**Seguridad**: Nunca compartir, rotar periódicamente en producción

### JWT_EXPIRES_IN
**Descripción**: Tiempo de expiración del token JWT  
**Valores válidos**: `1h`, `24h`, `7d`, etc.  
**Default**: `24h`  
**Seguridad**: No requiere protección especial

### PORT
**Descripción**: Puerto en el que corre el servidor  
**Default**: `3000`  
**Seguridad**: No requiere protección especial

### NODE_ENV
**Descripción**: Entorno de ejecución  
**Valores válidos**: `development`, `production`, `test`  
**Default**: `development`  
**Seguridad**: No requiere protección especial

### AFIP_CUIT
**Descripción**: CUIT del profesional para integración AFIP (opcional)  
**Formato**: 11 dígitos numéricos  
**Ejemplo**: `20123456789`  
**Seguridad**: No incluir en versiones públicas, usar variables de entorno

### AFIP_CERT_PATH
**Descripción**: Ruta al certificado digital AFIP (opcional)  
**Formato**: Ruta absoluta al archivo .pfx  
**Seguridad**: El certificado debe estar protegido con contraseña

### AFIP_KEY_PATH
**Descripción**: Ruta a la llave privada AFIP (opcional)  
**Formato**: Ruta absoluta al archivo .key  
**Seguridad**: La llave debe estar protegida con contraseña

## Archivo .env.example

Para facilitar la configuración, se incluye un archivo `.env.example` con valores de ejemplo:

```env
# Database
DATABASE_URL=postgresql://usuario:password@localhost:5432/turnosar

# JWT Authentication
JWT_SECRET=tu_secreto_jwt_aqui
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# AFIP Integration (Opcional)
AFIP_CUIT=20123456789
AFIP_CERT_PATH=/path/to/certificado.pfx
AFIP_KEY_PATH=/path/to/llave.key
```

## Seguridad

### ✅ Buenas Prácticas
- Nunca versionar archivos `.env` con credenciales reales
- Usar `.env.example` con valores de ejemplo
- Rotar secretos periódicamente en producción
- Usar diferentes secretos para desarrollo y producción
- Limitar acceso a archivos de configuración
- Usar gestores de secretos en producción (AWS Secrets Manager, HashiCorp Vault, etc.)

### ❌ Prácticas a Evitar
- Commit de `.env` con credenciales reales
- Compartir credenciales por chat, email o tickets
- Usar contraseñas débiles o predeterminadas
- Reutilizar secretos entre proyectos
- Exponer variables de entorno en logs
- Almacenar credenciales en código fuente

## Generación de Secretos Seguros

### JWT Secret
```bash
# Generar JWT secret seguro
openssl rand -base64 32
```

### Database Password
```bash
# Generar contraseña segura
openssl rand -base64 16
```

## Verificación

Para verificar que las variables de entorno están configuradas correctamente:

```bash
# Listar variables de entorno (Linux/Mac)
env | grep DATABASE_URL
env | grep JWT_SECRET

# Listar variables de entorno (Windows PowerShell)
Get-ChildItem Env: | Where-Object {$_.Name -like "DATABASE_URL"}
Get-ChildItem Env: | Where-Object {$_.Name -like "JWT_SECRET"}
```

## Problemas Comunes

### Error: "DATABASE_URL is not defined"
**Solución**: Verificar que el archivo `.env` existe en la raíz del proyecto y que la variable está definida.

### Error: "JWT_SECRET is not defined"
**Solución**: Agregar `JWT_SECRET` al archivo `.env` con una cadena aleatoria segura.

### Error: "Connection refused"
**Solución**: Verificar que PostgreSQL esté corriendo y que el puerto y host en `DATABASE_URL` sean correctos.
