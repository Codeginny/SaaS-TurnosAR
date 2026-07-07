# Roadmap de Desarrollo - TurnosAR

## Estado del Proyecto: 🚀 En Desarrollo Activo

---

## ✅ Items Completados

### Infraestructura y Configuración
- ✅ **Configuración de PostgreSQL** - Migración desde MongoDB completada
- ✅ **Sistema de Autenticación JWT** - Implementado con bcrypt
- ✅ **Validación de Schemas** - Zod integrado en backend
- ✅ **Documentación de API** - Swagger/OpenAPI configurado
- ✅ **CORS configurado** - Para comunicación cliente-servidor

### Base de Datos
- ✅ **Estructura SQL Inmutable** - `server/database/structure.sql` como Single Source of Truth
- ✅ **Migraciones de Base de Datos** - Script de estructura idempotente
- ✅ **Índices UNIQUE** - DNI y email a nivel de motor
- ✅ **Integridad Referencial** - FOREIGN KEY con CASCADE DELETE
- ✅ **Columnas de Facturación** - CAE, vencimiento, URL (AFIP-Ready)
- ✅ **Tipado Estricto** - VARCHAR(20) para teléfonos internacionales

### Backend - Autenticación y Usuarios
- ✅ **Registro de Pacientes** - Con validaciones completas
- ✅ **Registro de Profesionales** - Con especialidades y clínicas
- ✅ **Login de Pacientes** - Con DNI y contraseña
- ✅ **Login de Profesionales** - Con email y contraseña
- ✅ **Hash de Contraseñas** - bcrypt con SALT_ROUNDS=10
- ✅ **Tokens JWT** - Generación y validación

### Backend - Turnos
- ✅ **Creación de Turnos** - Con validaciones completas
- ✅ **Actualización de Turnos** - Cambio de estados
- ✅ **Cancelación de Turnos** - Con lógica de negocio
- ✅ **Listado de Turnos** - Por paciente y profesional
- ✅ **Precio por Consulta** - Valor por defecto $30,000

### Backend - Estadísticas y Analytics
- ✅ **Endpoint /api/stats/professional** - Estadísticas detalladas
- ✅ **Endpoint /api/stats/capacity** - Matriz de capacidad (Heatmap)
- ✅ **Filtros de Tiempo** - Hoy, Semana, Mes, Año
- ✅ **Comparativa de Rendimiento** - % de crecimiento vs periodo anterior
- ✅ **Tasa de Ausentismo** - Cálculo y alertas visuales
- ✅ **Drill-down de Pacientes** - Lista detallada por periodo

### Backend - Facturación (AFIP-Ready)
- ✅ **Servicio billingService.js** - Simulación AFIP desacoplada
- ✅ **Lógica de Liquidación** - Reglas de 48 horas y penalidades
- ✅ **Generación de CAE** - Simulado con delay de red
- ✅ **Generación de QR** - Para validación de comprobantes
- ✅ **Endpoint /api/billing/generate** - Generación de comprobantes
- ✅ **Endpoint /api/billing/invoice/:id** - Consulta de comprobantes
- ✅ **Idempotencia** - Prevención de facturación duplicada

### Frontend - UI/UX
- ✅ **React 18 + Vite** - Setup moderno y rápido
- ✅ **TailwindCSS 3.4** - Sistema de diseño consistente
- ✅ **Modo Oscuro** - Implementado en todas las páginas
- ✅ **Responsive Design** - Mobile-first con breakpoints optimizados
- ✅ **Lucide Icons** - Iconos modernos y consistentes
- ✅ **Context API** - Manejo de estado global

### Frontend - Páginas
- ✅ **Home Page** - Landing page con estadísticas
- ✅ **Patient Login** - Login específico con DNI
- ✅ **Patient Register** - Registro con validaciones
- ✅ **Patient Dashboard** - Panel del paciente
- ✅ **Professional Dashboard** - Panel del profesional
- ✅ **Pricing Page** - Planes y tarifas
- ✅ **FAQ Page** - Preguntas frecuentes
- ✅ **Contact Page** - Formulario de contacto

### Frontend - Componentes
- ✅ **UserAvatar** - Menú desplegable con opciones
- ✅ **ProfessionalStats** - Estadísticas con gráficos Recharts
- ✅ **CapacityHeatmap** - Matriz de capacidad operativa
- ✅ **FacturaPreview** - Vista previa de factura AFIP
- ✅ **PhoneInput** - Input de teléfono con react-phone-input-2
- ✅ **Modal de Pacientes** - Drill-down interactivo

### Frontend - Features
- ✅ **Selector de Periodo** - Hoy, Semana, Mes, Año
- ✅ **Comparativa de Crecimiento** - Indicador visual verde/rojo
- ✅ **Alerta de Ausentismo** - Visual cuando > 20%
- ✅ **Botón Emitir Factura** - En modal de pacientes
- ✅ **Loading States** - "Comunicando con ARCA..."
- ✅ **Tooltips Interactivos** - Con sugerencias de negocio

### Testing
- ✅ **Vitest instalado** - Framework de testing moderno
- ✅ **Supertest instalado** - Testing de endpoints HTTP
- ✅ **Tests de Autenticación** - 5 tests clave implementados
  - Registro exitoso de paciente
  - Error 400 al registrar DNI duplicado
  - Verificación de hash de contraseña (bcrypt)
  - Login exitoso con credenciales correctas
  - Error 401 con credenciales incorrectas
- ✅ **Script npm test** - Configurado en package.json

### Documentación
- ✅ **README actualizado** - Con sección de tests y arquitectura de BD
- ✅ **Documentación de API** - Swagger/OpenAPI
- ✅ **Guías de instalación** - Pasos claros para setup
- ✅ **Documentación de BD** - Arquitectura y decisiones técnicas

### Seed Data
- ✅ **Script seed.js** - Generación de datos de prueba
- ✅ **5 Profesionales** - Con especialidades reales
- ✅ **50 Turnos** - Distribuidos en últimos 4 meses
- ✅ **Estados variados** - confirmado, completado, cancelado
- ✅ **Script npm db:seed** - Configurado en package.json

---

## 🚧 En Progreso

### Frontend
- 🚧 **Optimización de Performance** - React.memo, useCallback, useMemo
- 🚧 **PWA Completa** - Service Worker avanzado
- 🚧 **Tests E2E** - Cypress para flujos completos

---

## 📋 Próximos Pasos

### Prioridad Alta
- [ ] **Tests de Facturación** - Validar lógica de 48hs
- [ ] **Tests de Estadísticas** - Validar cálculos de ingresos
- [ ] **Tests de Capacity** - Validar matriz de ocupación
- [ ] **CI/CD Pipeline** - GitHub Actions para tests automáticos

### Prioridad Media
- [ ] **App Móvil** - React Native o PWA mejorada
- [ ] **Notificaciones Push** - Recordatorios de turnos
- [ ] **Integración WhatsApp** - Envío de facturas
- [ ] **Sistema de Calificaciones** - Feedback de pacientes

### Prioridad Baja
- [ ] **Telemedicina** - Videollamadas integradas
- [ ] **Analytics Avanzados** - IA para optimización de agendas
- [ ] **Integración Wearables** - Datos de salud IoT
- [ ] **API Pública** - Para desarrolladores externos

---

## 🎯 Objetivos de Negocio

### Corto Plazo (3 meses)
- [ ] Lanzamiento beta con 100 profesionales
- [ ] 1,000 turnos agendados
- [ ] Feedback de usuarios y mejoras

### Mediano Plazo (6 meses)
- [ ] 1,000 profesionales activos
- [ ] 50,000 turnos por mes
- [ ] Integración con clínicas principales

### Largo Plazo (1 año)
- [ ] 20,000 profesionales en Argentina
- [ ] 14,000,000 turnos por año
- [ ] Liderazgo en el mercado

---

## 📊 Métricas de Éxito

### Técnicas
- [ ] 95%+ de cobertura de tests
- [ ] < 500ms tiempo de respuesta API
- [ ] 99.9% uptime del servidor
- [ ] < 1s tiempo de carga del cliente

### Negocio
- [ ] 60% menos ausentismo de pacientes
- [ ] 40% más rentabilidad del consultorio
- [ ] 4.8/5 rating de satisfacción
- [ ] 30% tasa de retención de profesionales

---

## 🔄 Ciclo de Desarrollo

### Branch Strategy
- `main` - Producción
- `develop` - Desarrollo
- `feature/*` - Features nuevas
- `bugfix/*` - Correcciones de bugs
- `hotfix/*` - Correcciones urgentes en producción

### Proceso
1. Crear branch desde `develop`
2. Desarrollar feature con tests
3. PR con revisión de código
4. Merge a `develop` después de aprobación
5. Deploy a staging
6. Merge a `main` para producción

---

## 📝 Notas

### Decisiones Técnicas Importantes
- **PostgreSQL sobre MongoDB**: Mejor para relaciones y consistencia
- **JWT sobre Sessions**: Stateless y escalable
- **Zod sobre Joi**: Más moderno y type-safe
- **Vitest sobre Jest**: Más rápido y mejor DX
- **Tailwind sobre CSS Modules**: Más rápido de desarrollar

### Lecciones Aprendidas
- La idempotencia en scripts SQL es crucial
- Los tests unitarios ahorran tiempo a largo plazo
- La documentación debe mantenerse actualizada
- La arquitectura desacoplada facilita cambios

---

**Última actualización**: 27 de Abril, 2026
**Versión**: 1.0.0
**Estado**: 🚀 Activo en desarrollo
