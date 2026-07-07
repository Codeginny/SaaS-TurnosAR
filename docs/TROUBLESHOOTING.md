# Solución de Problemas

Este documento proporciona soluciones para errores comunes que pueden ocurrir al configurar y ejecutar TurnosAR.

## Errores de Base de Datos

### Error: duplicate key value violates unique constraint "pacientes_dni_key"

**Descripción**: Intento de registrar un paciente con un DNI que ya existe en la base de datos.

**Causa**: El seed script ha corrido múltiples veces o hay datos duplicados.

**Solución**:
```bash
# Ejecutar el seed para limpiar y recrear datos
npm run db:seed
```

**Prevención**: El seed script ahora incluye `TRUNCATE TABLE pacientes RESTART IDENTITY CASCADE` para evitar duplicados.

---

### Error: duplicate key value violates unique constraint "profesionales_email_key"

**Descripción**: Intento de registrar un profesional con un email que ya existe.

**Causa**: El profesional ya está registrado.

**Solución**:
- Usar un email diferente
- O hacer login con el email existente

---

### Error: connection refused

**Descripción**: No se puede conectar a PostgreSQL.

**Causa**: PostgreSQL no está corriendo o la URL de conexión es incorrecta.

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql  # Linux
brew services list postgresql     # macOS

# Iniciar PostgreSQL si no está corriendo
sudo systemctl start postgresql   # Linux
brew services start postgresql    # macOS

# Verificar la URL en .env
DATABASE_URL=postgresql://usuario:password@localhost:5432/turnosar
```

---

### Error: database "turnosar" does not exist

**Descripción**: La base de datos no ha sido creada.

**Causa**: La base de datos no existe o el nombre es incorrecto.

**Solución**:
```bash
# Crear la base de datos
createdb turnosar

# O ejecutar el script de estructura
psql -U tu_usuario -d postgres -f server/database/structure.sql
```

---

## Errores de Autenticación

### Error: JWT malformed

**Descripción**: El token JWT está malformado o corrupto.

**Causa**: Token corrupto en localStorage o formato incorrecto.

**Solución**:
```javascript
// Limpiar localStorage
localStorage.clear();

// Hacer login nuevamente
```

---

### Error: JWT expired

**Descripción**: El token JWT ha expirado.

**Causa**: El token tiene una duración de 24 horas y ha expirado.

**Solución**:
- Hacer login nuevamente para obtener un nuevo token
- El sistema debería redirigir automáticamente al login

---

### Error: Invalid credentials

**Descripción**: Credenciales incorrectas al hacer login.

**Causa**: Email/DNI o contraseña incorrectos.

**Solución**:
- Verificar que el email/DNI sea correcto
- Verificar que la contraseña sea correcta
- Si olvidó la contraseña, contacte al administrador

---

## Errores del Servidor

### Error: EADDRINUSE: address already in use

**Descripción**: El puerto 3000 ya está en uso.

**Causa**: Otro proceso está usando el puerto 3000.

**Solución**:
```bash
# Encontrar el proceso usando el puerto
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Matar el proceso
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# O cambiar el puerto en .env
PORT=3001
```

---

### Error: Cannot find module

**Descripción**: Módulo de Node.js no encontrado.

**Causa**: Dependencias no instaladas.

**Solución**:
```bash
# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd client
npm install
```

---

## Errores del Cliente

### Error: Network Error

**Descripción**: El cliente no puede conectar con el servidor.

**Causa**: Servidor no corriendo o URL incorrecta.

**Solución**:
```bash
# Verificar que el servidor esté corriendo
cd server
npm start

# Verificar la URL del API client
# En client/src/services/backendAPI.js
const API_URL = 'http://localhost:3000/api';
```

---

### Error: 401 Unauthorized

**Descripción**: El usuario no está autorizado para acceder a un recurso.

**Causa**: Token JWT inválido o expirado.

**Solución**:
- El sistema redirige automáticamente al login con SweetAlert2
- Limpia localStorage (token y user)
- Hacer login nuevamente
- Verificar que el token se esté enviando en el header Authorization
- Verificar que el usuario tenga el rol correcto (patient vs professional)

**Nota**: El interceptor de Axios en `client/src/api/axiosInstance.js` maneja automáticamente los errores 401:
```javascript
backendAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/patient-login?expired=true';
    }
    return Promise.reject(error);
  }
);
```

---

### Error: 403 Forbidden

**Descripción**: El usuario no tiene permiso para acceder a un recurso.

**Causa**: Intentando acceder a recursos de otro usuario o rol incorrecto.

**Solución**:
- Pacientes solo pueden acceder a sus propios turnos
- Profesionales solo pueden acceder a sus estadísticas
- Verificar que estás usando las credenciales correctas

---

## Errores de Facturación

### Error: El turno ya tiene un comprobante generado

**Descripción**: Intento de generar factura para un turno ya facturado.

**Causa**: El turno ya tiene CAE generado.

**Solución**:
- Usar el botón "Ver Factura" en lugar de "Emitir Factura"
- El sistema debería mostrar automáticamente la factura existente

---

### Error: Solo se pueden facturar turnos completados o cancelados

**Descripción**: Intento de facturar un turno en estado "confirmado".

**Causa**: Solo se pueden facturar turnos completados o cancelados.

**Solución**:
- Esperar a que el turno sea completado
- O cancelar el turno primero

---

## Errores de Seed

### Error: seed.js: command not found

**Descripción**: El comando npm run db:seed no funciona.

**Causa**: Script no definido en package.json.

**Solución**:
```bash
# Verificar que el script exista en package.json
cat server/package.json | grep db:seed

# Si no existe, agregarlo manualmente
cd server
npm run seed
```

---

### Error: Relation "turnos" does not exist

**Descripción**: La tabla turnos no existe.

**Causa**: La estructura de la base de datos no ha sido creada.

**Solución**:
```bash
# Ejecutar el script de estructura
psql -U tu_usuario -d turnosar -f server/database/structure.sql
```

---

## Errores de Testing

### Error: Test failed: Cannot connect to database

**Descripción**: Los tests no pueden conectar a la base de datos.

**Causa**: Base de datos de test no configurada o no existe.

**Solución**:
```bash
# Crear base de datos de test
createdb turnosar_test

# Ejecutar estructura en base de datos de test
DATABASE_URL=postgresql://usuario:password@localhost:5432/turnosar_test psql -f server/database/structure.sql
```

---

### Error: Test timeout

**Descripción**: Los tests están tardando demasiado.

**Causa**: Base de datos lenta o queries ineficientes.

**Solución**:
- Verificar que PostgreSQL tenga suficientes recursos
- Optimizar las queries con índices
- Aumentar el timeout en la configuración de Vitest

---

## Problemas de Rendimiento

### El dashboard carga lentamente

**Causa**: Demasiados datos en las estadísticas o queries sin optimizar.

**Solución**:
- Reducir el periodo de análisis (ej. usar "mes" en lugar de "año")
- Agregar índices a las columnas frecuentemente consultadas
- Implementar paginación en el listado de pacientes

---

### El seed tarda demasiado

**Causa**: Demasiados datos siendo insertados.

**Solución**:
- Reducir la cantidad de turnos en el seed
- Usar bulk inserts en lugar de inserts individuales
- Deshabilitar constraints temporariamente durante el seed

---

## Problemas de UI/UX

### Error: trim is not a function

**Descripción**: Error al intentar usar `.trim()` en un valor numérico.

**Causa**: El DNI viene de PostgreSQL como número (BIGINT/INTEGER) pero el código espera un string.

**Solución**:
- Convertir el DNI a string antes de validarlo
- Usar `String(userData.dni || '').trim()` en lugar de `userData.dni.trim()`

**Ejemplo**:
```javascript
// En PatientDashboard.jsx - validateUserData
const dniString = String(userData.dni || '');
if (!dniString.trim()) {
  errors.dni = 'El DNI es obligatorio';
}
```

---

### Los profesionales no aparecen en el filtro

**Descripción**: Al seleccionar una provincia, no se muestran profesionales aunque existan en la base de datos.

**Causa**: Diferencia de mayúsculas/minúsculas o espacios invisibles entre la selección del usuario y los datos de la base de datos.

**Solución**:
- Usar filtros case-insensitive con trim
- Normalizar ambos lados de la comparación

**Ejemplo**:
```javascript
// En Turnero.jsx - profesionalesFiltrados
const profesionalesFiltrados = useMemo(() => {
  return profesionales.filter(p => {
    if (!p.provincia || p.provincia.trim() === '') return false;
    
    // Filtro case-insensitive con trim
    if (provincia && p.provincia.trim().toLowerCase() !== provincia.trim().toLowerCase()) return false;
    
    return true;
  });
}, [profesionales, provincia, clinica, especialidad]);
```

---

### Los gráficos no se muestran

**Causa**: Datos vacíos o error en la librería de gráficos.

**Solución**:
- Verificar que haya datos en el periodo seleccionado
- Cambiar el periodo a uno con datos (ej. "mes")
- Verificar la consola del navegador para errores de JavaScript

### El modal no se cierra

**Causa**: Estado de React no actualizado correctamente.

**Solución**:
- Verificar que el estado `showModal` se esté actualizando
- Recargar la página
- Verificar que no haya errores de JavaScript en la consola

---

## Arquitectura y Dependencias

### Eliminación de MockAPI

**Descripción**: El sistema ya no usa MockAPI para datos de prueba.

**Causa**: MockAPI fue eliminado para usar únicamente PostgreSQL como Single Source of Truth.

**Solución**:
- Todas las llamadas a la API usan `backendAPI` en lugar de `mockAPI`
- Las validaciones de frontend ahora usan `client/src/utils/validators.js`
- El archivo `client/src/data/mockDatabase.js` ya no se importa en producción

**Ejemplo**:
```javascript
// Antes (usando mockDatabase.js)
import { validarFormatoDNI, validarContraseña } from '../data/mockDatabase.js';

// Ahora (usando validators.js)
import { validarFormatoDNI, validarContraseña } from '../utils/validators.js';
```

**Archivos afectados**:
- `client/src/api/axiosInstance.js` - Eliminada instancia mockAPI
- `client/src/pages/Login.jsx` - Eliminada importación de mockDatabase.js
- `client/src/pages/PatientLogin.jsx` - Cambiado a validators.js
- `client/src/context/AppointmentContext.jsx` - Cambiado a backendAPI
- `client/src/pages/PatientDashboard.jsx` - Cambiado a backendAPI

---

## Cómo Obtener Ayuda

### Logs del Servidor

```bash
# Ver logs del servidor en tiempo real
cd server
npm start  # Los logs se muestran en la terminal

# O guardar logs en archivo
npm start > server.log 2>&1
tail -f server.log
```

### Logs del Cliente

```bash
# Abrir las DevTools del navegador (F12)
# Ir a la pestaña Console
# Los errores de JavaScript se muestran aquí
```

### Database Logs

```bash
# Ver logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log  # Linux
tail -f /usr/local/var/log/postgres.log  # macOS
```

---

## Contacto de Soporte

Si el problema persiste después de intentar estas soluciones:

1. Revisar la documentación en `docs/`
2. Verificar los issues en el repositorio
3. Contactar al equipo de desarrollo

**⚠️ IMPORTANTE**: Nunca incluyas credenciales reales (contraseñas, tokens, API keys) al reportar un problema. Usa ejemplos o datos de prueba.
