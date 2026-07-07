# 🛡️ Configuración del Servidor Backend - Sistema TurnosAR

## 📋 Descripción

Este documento explica cómo configurar y ejecutar el servidor backend que maneja la autenticación y seguridad con Bcrypt para el sistema TurnosAR.

## 🚀 Instalación y Configuración

### **1. Instalar Dependencias**

```bash
npm install bcrypt express cors dotenv axios
npm install --save-dev nodemon concurrently
```

### **2. Configurar Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```env
# Configuración del Servidor Backend TurnosAR
PORT=3000
NODE_ENV=development

# Configuración de Bcrypt
BCRYPT_SALT_ROUNDS=10
```

### **3. Scripts Disponibles**

```bash
# Ejecutar solo el servidor backend
npm run server

# Ejecutar servidor backend en modo desarrollo (con auto-reload)
npm run dev:server

# Ejecutar frontend y backend simultáneamente
npm run dev:full
```

## 🔐 Endpoints de Seguridad

### **Registro de Profesionales**
```http
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "nombre": "Dr. Juan Pérez",
  "email": "juan@email.com",
  "telefono": "011-1234-5678",
  "especialidad": "Cardiología",
  "password": "password123"
}
```

### **Login de Profesionales**
```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "juan@email.com",
  "password": "password123"
}
```

### **Registro de Pacientes (Auto-registro)**
```http
POST http://localhost:3000/api/patient-register
Content-Type: application/json

{
  "dni": "12345678",
  "password": "12345678"
}
```

### **Login de Pacientes**
```http
POST http://localhost:3000/api/patient-login
Content-Type: application/json

{
  "dni": "12345678",
  "password": "12345678"
}
```

### **Cambio de Contraseña de Pacientes**
```http
PUT http://localhost:3000/api/patient-change-password/1
Content-Type: application/json

{
  "currentPassword": "12345678",
  "newPassword": "nuevaPassword123"
}
```

### **Validación de Credenciales**
```http
POST http://localhost:3000/api/validate-credentials
Content-Type: application/json

{
  "dni": "12345678",
  "password": "password123",
  "tipo": "paciente"
}
```

### **Estado del Servidor**
```http
GET http://localhost:3000/api/health
```

## 🏗️ Arquitectura del Sistema

### **Flujo de Seguridad:**

1. **Frontend** → Envía credenciales en texto plano
2. **Backend** → Recibe credenciales y las procesa con Bcrypt
3. **PostgreSQL** → Almacena solo hashes de contraseñas
4. **Backend** → Devuelve respuesta sin contraseñas

### **Separación de Responsabilidades:**

- **Frontend (React)**: Interfaz de usuario, validaciones básicas
- **Backend (Express)**: Autenticación, hashing, validación de credenciales
- **PostgreSQL**: Almacenamiento de datos (solo hashes)

## 🔧 Configuración de Desarrollo

### **Ejecutar en Modo Desarrollo Completo:**

```bash
# Terminal: Ejecutar backend y frontend
npm run dev:full
```

### **URLs de Desarrollo:**

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## 🛡️ Características de Seguridad

### **Bcrypt Implementation:**
- **Salt Rounds**: 10 (configurable)
- **Hashing**: SHA-256 con salt único
- **Comparación**: Segura con `bcrypt.compare()`

### **Validaciones:**
- Contraseñas mínimo 6 caracteres
- Validación de formato de email
- Validación de DNI argentino
- Sanitización de datos de entrada

### **Respuestas Seguras:**
- Nunca se devuelven contraseñas en las respuestas
- Hashes solo se almacenan en PostgreSQL
- Tokens de sesión (futuro)

## 🚨 Solución de Problemas

### **Error: "process is not defined"**
- **Causa**: Intentar usar Bcrypt en el frontend
- **Solución**: Usar el servidor backend para todas las operaciones de Bcrypt

### **Error: "Cannot connect to backend"**
- **Causa**: Servidor backend no está ejecutándose
- **Solución**: Ejecutar `npm run server` o `npm run dev:full`

### **Error: "PostgreSQL connection failed"**
- **Causa**: PostgreSQL no está ejecutándose
- **Solución**: Verificar que PostgreSQL esté corriendo y configuración de .env

## 📝 Notas Importantes

1. **Bcrypt solo en Backend**: Nunca usar Bcrypt en el frontend
2. **Contraseñas en texto plano**: Solo se envían al backend, nunca se almacenan
3. **Hashes seguros**: Solo se almacenan hashes en PostgreSQL
4. **Validación doble**: Frontend y backend validan datos
5. **Respuestas limpias**: Nunca incluir contraseñas en respuestas

## 🔄 Flujo de Datos

```
Frontend → Backend → PostgreSQL
    ↓         ↓         ↓
  UI/UX   Bcrypt    Storage
  Valid   Hash      Hash Only
```

¡El sistema ahora es completamente seguro con Bcrypt en el backend! 🎉
