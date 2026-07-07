# API Endpoints

## Descripción

Este documento documenta todos los endpoints de la API REST de TurnosAR, incluyendo métodos, parámetros, respuestas y códigos de estado.

## Base URL

```
Desarrollo: http://localhost:3000/api
Producción: https://tu-dominio.com/api
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT en el header `Authorization`:

```
Authorization: Bearer <token_jwt>
```

El token se obtiene al hacer login y tiene una duración de 24 horas por defecto.

---

## Autenticación

### Registro de Paciente

Registra un nuevo paciente en el sistema.

```
POST /auth/register/patient
```

**Body:**
```json
{
  "dni": "30000000",
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+54 11 1234-5678",
  "password": "password123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Paciente registrado exitosamente",
  "paciente": {
    "id": 1,
    "dni": "30000000",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "telefono": "+54 11 1234-5678"
  }
}
```

**Errores:**
- `400`: Datos inválidos o DNI/email duplicados
- `500`: Error interno del servidor

---

### Login de Paciente

Autentica a un paciente y devuelve un token JWT.

```
POST /auth/login/patient
```

**Body:**
```json
{
  "dni": "30000000",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "dni": "30000000",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "role": "patient"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Credenciales incorrectas
- `500`: Error interno del servidor

---

### Registro de Profesional

Registra un nuevo profesional en el sistema.

```
POST /auth/register/professional
```

**Body:**
```json
{
  "nombre": "Dr. Carlos Méndez",
  "email": "carlos.mendez@example.com",
  "cuit": "20123456789",
  "especialidad": "Cardiología",
  "clinica": "Clínica del Sol",
  "telefono": "+54 11 4456-7894",
  "password": "password123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Profesional registrado exitosamente",
  "profesional": {
    "id": 1,
    "nombre": "Dr. Carlos Méndez",
    "email": "carlos.mendez@example.com",
    "cuit": "20123456789",
    "especialidad": "Cardiología",
    "clinica": "Clínica del Sol"
  }
}
```

**Errores:**
- `400`: Datos inválidos o CUIT/email duplicados
- `500`: Error interno del servidor

---

### Login de Profesional

Autentica a un profesional y devuelve un token JWT.

```
POST /auth/login/professional
```

**Body:**
```json
{
  "email": "carlos.mendez@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Dr. Carlos Méndez",
    "email": "carlos.mendez@example.com",
    "cuit": "20123456789",
    "role": "professional"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Credenciales incorrectas
- `500`: Error interno del servidor

---

## Turnos

### Crear Turno

Crea un nuevo turno médico.

```
POST /appointments
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Body:**
```json
{
  "provincia": "Buenos Aires",
  "clinica": "Clínica del Sol",
  "especialidad": "Cardiología",
  "profesional": "Dr. Carlos Méndez",
  "fecha": "2026-04-28",
  "hora": "10:00",
  "pacienteId": 1,
  "precioConsulta": 30000
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Turno creado exitosamente",
  "turno": {
    "id": 1,
    "paciente_id": 1,
    "fecha": "2026-04-28",
    "hora": "10:00",
    "estado": "confirmado",
    "precio_consulta": 30000
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autorizado
- `403`: No puedes crear turnos para otro paciente
- `404`: Paciente no encontrado
- `500`: Error interno del servidor

---

### Listar Turnos

Lista todos los turnos del paciente autenticado.

```
GET /appointments
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Query Params:**
- `estado` (opcional): Filtrar por estado (confirmado, completado, cancelado)
- `fecha_desde` (opcional): Fecha desde (YYYY-MM-DD)
- `fecha_hasta` (opcional): Fecha hasta (YYYY-MM-DD)

**Respuesta Exitosa (200):**
```json
{
  "turnos": [
    {
      "id": 1,
      "fecha": "2026-04-28",
      "hora": "10:00",
      "estado": "confirmado",
      "clinica": "Clínica del Sol",
      "especialidad": "Cardiología",
      "profesional": "Dr. Carlos Méndez"
    }
  ]
}
```

**Errores:**
- `401`: No autorizado
- `500`: Error interno del servidor

---

### Obtener Turno

Obtiene los detalles de un turno específico.

```
GET /appointments/:id
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Respuesta Exitosa (200):**
```json
{
  "turno": {
    "id": 1,
    "fecha": "2026-04-28",
    "hora": "10:00",
    "estado": "confirmado",
    "clinica": "Clínica del Sol",
    "especialidad": "Cardiología",
    "profesional": "Dr. Carlos Méndez",
    "precio_consulta": 30000
  }
}
```

**Errores:**
- `401`: No autorizado
- `403`: No tienes acceso a este turno
- `404`: Turno no encontrado
- `500`: Error interno del servidor

---

### Editar Turno

Edita un turno existente.

```
PUT /appointments/:id
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Body:**
```json
{
  "fecha": "2026-04-29",
  "hora": "11:00"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Turno actualizado exitosamente",
  "turno": {
    "id": 1,
    "fecha": "2026-04-29",
    "hora": "11:00",
    "estado": "confirmado"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autorizado
- `403`: No puedes editar turnos de otro paciente
- `404`: Turno no encontrado
- `500`: Error interno del servidor

---

### Cancelar Turno

Cancela un turno existente.

```
DELETE /appointments/:id
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Turno cancelado exitosamente",
  "turno": {
    "id": 1,
    "estado": "cancelado",
    "fecha_cancelacion": "2026-04-27T14:30:00.000Z"
  }
}
```

**Errores:**
- `401`: No autorizado
- `403`: No puedes cancelar turnos de otro paciente
- `404`: Turno no encontrado
- `500`: Error interno del servidor

---

## Estadísticas

### Estadísticas del Profesional

Obtiene estadísticas detalladas del profesional autenticado.

```
GET /stats/professional
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Query Params:**
- `periodo` (opcional): hoy, semana, mes, año (default: mes)

**Respuesta Exitosa (200):**
```json
{
  "profesional": "Dr. Carlos Méndez",
  "periodo": "mes",
  "mesActual": {
    "totalGanado": 900000,
    "totalTurnos": 30,
    "crecimientoPorcentaje": 15.5
  },
  "hoy": {
    "totalTurnos": 3
  },
  "turnosPorEstado": {
    "confirmado": 15,
    "completado": 10,
    "cancelado": 5
  },
  "turnosPorDia": [
    {
      "dia": "Lunes",
      "diaNumero": 1,
      "totalTurnos": 5
    },
    {
      "dia": "Martes",
      "diaNumero": 2,
      "totalTurnos": 4
    }
  ],
  "pacientes": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+54 11 1234-5678",
      "fecha": "2026-04-28",
      "hora": "10:00",
      "estado": "confirmado",
      "facturado": false
    }
  ],
  "tasaAusentismo": 16.67,
  "costoConsulta": 30000
}
```

**Errores:**
- `401`: No autorizado
- `403`: Solo profesionales pueden acceder
- `500`: Error interno del servidor

---

### Matriz de Capacidad

Obtiene la matriz de capacidad operativa del profesional.

```
GET /stats/capacity
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Query Params:**
- `periodo` (opcional): Días de histórico (default: 90)

**Respuesta Exitosa (200):**
```json
{
  "profesional": "Dr. Carlos Méndez",
  "periodo": 90,
  "matriz": [
    {
      "dia": "Lunes",
      "hora": 9,
      "turnos": 1,
      "ocupacion": 50,
      "sugerencia": "Horario en rango óptimo"
    },
    {
      "dia": "Lunes",
      "hora": 10,
      "turnos": 2,
      "ocupacion": 100,
      "sugerencia": "Considera ampliar horarios"
    }
  ]
}
```

**Errores:**
- `401`: No autorizado
- `403`: Solo profesionales pueden acceder
- `500`: Error interno del servidor

---

## Facturación

### Nota Importante: Simulación AFIP-Ready

⚠️ **IMPORTANTE**: Los endpoints de facturación actualmente devuelven datos simulados con la **estructura real** de los comprobantes de AFIP. El sistema está diseñado y listo para producción; solo requiere el intercambio de las claves privadas del profesional con los Web Services de ARCA/AFIP para pasar de simulación a producción real.

Esta transparencia técnica genera confianza: el sistema respeta los estándares de AFIP y está preparado para integración real.

---

### Generar Comprobante

Genera un comprobante fiscal para un turno.

```
POST /billing/generate
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Body:**
```json
{
  "turnoId": 1
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Comprobante generado exitosamente",
  "comprobante": {
    "cae": "12345678901234",
    "caeVencimiento": "2026-05-07",
    "puntoVenta": 1,
    "numeroComprobante": "00001-00001234",
    "tipo": "FACTURA_C",
    "montoTotal": 30000,
    "montoGravado": 0,
    "montoIva": 0,
    "concepto": "Consulta médica",
    "observacion": "Turno completado",
    "qrUrl": "https://www.afip.gob.ar/fe/qr/?p=..."
  },
  "emisor": {
    "nombre": "Dr. Carlos Méndez",
    "cuit": "20123456789"
  },
  "receptor": {
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "telefono": "+54 11 1234-5678"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autorizado
- `403`: Solo profesionales pueden facturar
- `404`: Turno no encontrado
- `409`: El turno ya tiene un comprobante
- `500`: Error interno del servidor

---

### Obtener Factura

Obtiene un comprobante fiscal existente.

```
GET /billing/invoice/:turnoId
```

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "comprobante": {
    "cae": "12345678901234",
    "caeVencimiento": "2026-05-07",
    "tipo": "FACTURA_C",
    "montoTotal": 30000
  },
  "turno": {
    "id": 1,
    "fecha": "2026-04-28",
    "hora": "10:00"
  }
}
```

**Errores:**
- `401`: No autorizado
- `403`: Solo profesionales pueden acceder
- `404`: Turno no encontrado o no tiene factura
- `500`: Error interno del servidor

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autorizado o token inválido |
| 403 | Forbidden - No tienes permiso |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej. duplicado) |
| 500 | Internal Server Error - Error del servidor |

## Seguridad

### JWT Authentication
- El token JWT debe incluirse en el header `Authorization`
- El token tiene una duración de 24 horas
- Después de expirar, el usuario debe hacer login nuevamente

### Rate Limiting
- Los endpoints de autenticación tienen rate limiting
- Máximo 5 requests por minuto por IP

### Validación de Datos
- Todos los inputs son validados con Zod
- Los datos mal formateados retornan error 400

## Notas

- Todos los montos están expresados en Pesos Argentinos ($)
- Las fechas están en formato ISO 8601 (YYYY-MM-DD)
- Las horas están en formato 24h (HH:MM)
- Los DNI deben ser numéricos de 8 dígitos
- Los CUIT deben tener 11 dígitos
