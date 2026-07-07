<<<<<<< HEAD
# TurnosAR SaaS — Gestión de Consultorios, Facturación ARCA/AFIP y Business Intelligence Médico

## 1. Descripción del Sistema y Propósito de Negocio

TurnosAR es una solución de software como servicio (SaaS) multi-tenant de alto rendimiento y robustez transaccional diseñada específicamente para clínicas y consultorios independientes de salud en la República Argentina. El sistema migra la gestión tradicional de agendas de un modelo analógico hacia un ecosistema digital de Inteligencia de Negocios (BI), optimizando la capacidad instalada, reduciendo la tasa de inasistencias (No-Shows) y automatizando la simulación de facturación fiscal.

### 1.1 Rigor de Negocio

- **Mitigación Financiera del Ausentismo (No-Shows):** A través de lógicas de penalización y seguimiento dinámico que reducen el impacto financiero de las ausencias no anticipadas.
- **Optimización de Capacidad Operativa:** Matriz y heatmap de ocupación histórica para identificar y redistribuir turnos en "horas muertas" o de baja demanda.
- **Maximización del Ticket Promedio:** Análisis cruzado de aranceles particulares vs. convenios de obras sociales y prepagas para balancear la mezcla de facturación.
- **Aislamiento de Datos en Entornos Corporativos (Sec-01):** Prevención absoluta de fugas de datos entre inquilinos mediante un estricto aislamiento de base de datos multi-tenant a nivel de consultas SQL.

## 2. Decisiones de Arquitectura y Tecnologías (Tech Stack)

El sistema se diseñó bajo una arquitectura desacoplada y modular, garantizando la escalabilidad horizontal y un consumo de recursos controlado de forma lineal.

### 2.1 Capa de Datos y Persistencia (Database & Backend)

- **Node.js & Express.js:** Motor del servidor y API RESTful asíncrona.
- **PostgreSQL (Soporte local y en la nube con Supabase):** Motor de base de datos relacional elegido para el manejo de transacciones críticas ACID, control de concurrencia avanzado (MVCC) y consistencia métrica.
- **pg (node-postgres):** Driver nativo para la comunicación optimizada con la base de datos.
- **Transaction Connection Pooler (Supavisor - Puerto 6543):** Utilizado en producción para evitar la saturación de conexiones ante despliegues de contenedores o arquitectura serverless.
- **JWT (JSON Web Tokens):** Control de sesiones y autenticación segura con directivas de expiración estricta y control de roles (RBAC).

### 2.2 Capa de Interfaz y Visualización (Frontend & UI)

- **React 18 & Vite:** Framework para la construcción de interfaces reactivas y empaquetado optimizado ultra-veloz.
- **TailwindCSS 3.4 (Mobile-First):** Estilizado adaptativo optimizado con breakpoints responsivos dinámicos (`sm:`, `md:`, `lg:`) para una visualización perfecta en dispositivos móviles.
- **Chart.js / React-Chartjs-2:** Biblioteca de visualización interactiva para gráficos estadísticos (histogramas semanales, distribución por estado y series de tiempo de facturación).
- **Context API:** Gestor de estado global para sincronizar citas, flujos de auditoría y autenticación de usuarios de forma reactiva.

## 3. Requisitos Funcionales (RF) y Reglas de Negocio (RN) Aplicados

El desarrollo de TurnosAR sigue de forma rigurosa la especificación de requisitos formalizada para garantizar la integridad lógica y la consistencia del sistema.

### 3.1 Requisitos Funcionales (RF)

- **RF-001** `Prioridad: Alta` - **Validación de Identidad del Paciente:** El registro de pacientes exige un DNI inalterable. El backend valida de forma estricta que no existan duplicados (HTTP 409) para proteger la consistencia del historial clínico.
- **RF-002** `Prioridad: Alta` - **Inicio de Sesión Automatizado (Auto-Login):** Tras completar exitosamente el registro, el sistema genera de forma automática un token JWT e inicia la sesión del usuario para eliminar la fricción del onboarding.
- **RF-003** `Prioridad: Alta` - **Gestión de Disponibilidad Segmentada:** El profesional configura sus bloques de atención diarios, y el sistema los divide automáticamente en rangos individuales parametrizables (ej: bloques de 30 minutos) evitando la sobreventa.
- **RF-004** `Prioridad: Alta` - **Motor de Exportación en Streaming (BI):** Implementación de un endpoint optimizado para la transmisión asíncrona de reportes CSV mediante un flujo de datos que no satura la memoria RAM del servidor.
- **RF-005** `Prioridad: Alta` - **Filtro Temporal Dinámico:** Selector temporal en el Dashboard para alternar visualizaciones rápidas (Hoy, Semana, Mes, Año) o rangos libres de análisis de rentabilidad.
- **RF-006** `Prioridad: Media` - **Certificación Transaccional de Facturación:** Vinculación directa entre el cambio de estado del turno a "Completado" y la habilitación del emisor de comprobantes interactivos oficiales con CAE.

### 3.2 Reglas de Negocio (RN)

- **RN-001 - Penalización por Cancelación Tardía:** Si el paciente cancela un turno con menos de 24 horas de anticipación, el sistema retiene de forma automática el 20% del valor pre-autorizado de la consulta como compensación por capacidad perdida.
- **RN-002 - Control de Capacidad Máxima:** El backend bloquea la asignación de turnos si un bloque de hora supera el límite de ocupación segura configurada (`MAX_CAPACITY_PER_HOUR = 2` citas por hora para consultas estándar).
- **RN-003 - Consistencia de Límites Temporales:** Se rechaza cualquier consulta analítica si la fecha de inicio es cronológicamente posterior a la fecha de finalización.
- **RN-004 - Aislamiento Multi-tenant Estricto (Seguridad):** Toda consulta SQL de extracción de turnos o estadísticas financieras inyecta de forma implícita la restricción de identidad del profesional logueado (`WHERE profesional_id = req.user.id`), impidiendo la fuga de datos médicos entre distintas clínicas.
- **RN-005 - Restricción de Acceso por Roles (RBAC):** Únicamente los usuarios autenticados con rol de `professional` tienen permisos para consumir endpoints sensibles de facturación y exportación. Pacientes y colaboradores restringidos reciben un rechazo HTTP 403 Forbidden.

## 4. Metodologías de Ingeniería

### 4.1 Spec-Driven Development (SDD) & Open Spec

No se escribió código de manera descontrolada. El desarrollo se rigió bajo la metodología SDD, en la cual cada nueva funcionalidad (como la exportación pesada de datos o las restricciones por roles) fue planificada y validada previamente en documentos de cambio (change) y especificaciones de diseño. Esto garantizó que las actualizaciones en el backend no rompieran las interfaces reactivas del frontend.

### 4.2 Arquitectura Relacional (PostgreSQL) vs. Sistemas Monolíticos (PocketBase)

Durante la fase de diseño se analizó el uso de motores SQLite/PocketBase para prototipos rápidos. Sin embargo, para TurnosAR se tomó la decisión consciente de implementar PostgreSQL por dos pilares de negocio:
- **Manejo de Concurrencia (MVCC):** PostgreSQL no bloquea la base de datos ante operaciones de escritura recurrentes de múltiples clínicas, lo cual es crítico en horas pico de reserva y facturación de citas.
- **Rendimiento en Consultas Analíticas (BI):** La agregación de flujos de caja y el cálculo de tasas de ausentismo se realizan a nivel de base de datos relacional de forma extremadamente rápida.

### 4.3 Model Context Protocol (MCP) y Automatización del Entorno

Se utilizaron servidores MCP para conectar de forma ágil y segura las herramientas de la base de datos y la consola local con los agentes de inteligencia artificial. Esto permitió realizar migraciones de esquemas en tiempo real y ejecutar pruebas de regresión de manera autónoma sin intervención manual propensa a errores.

## 5. Funcionalidades Destacadas (Golden Path)

### 5.1 Módulo de Facturación Electrónica Interactiva (Simulador ARCA/AFIP)

La plataforma integra un simulador del servicio web oficial de facturación (WSFE v1.2 de la ex-AFIP, actual ARCA):
- **La Generación:** Al presionar "Facturar" en un turno con estado "Completado", el backend ejecuta validaciones de integridad, evita la facturación doble, genera un CAE (Código de Autorización Electrónico) único de 14 dígitos y calcula su fecha de vencimiento.
- **Generación de Factura C:** Renderizado de un modal que emula de forma idéntica el comprobante fiscal tipo C con su correspondiente código QR ficticio de validación y la codificación de ley "011".
- **Impresión de Alta Fidelidad (PDF):** Utilización de hojas de estilo `@media print` que formatean la factura a tamaño A4 para ser impresa físicamente o guardada directamente como PDF mediante el cuadro nativo del navegador, sin el costo de procesamiento de librerías del lado del servidor.

### 5.2 Motor de Exportación de Datos en Streaming (Business Intelligence)

La exportación analítica de la base de datos está blindada contra desbordamientos de memoria del servidor:
- **Arquitectura de Streams:** Uso de `pg-query-stream` en el backend. Los registros se leen y transmiten secuencialmente de forma asíncrona hacia el cliente en formato CSV, manteniendo constante y plano el uso de memoria RAM en el servidor, ideal para consultas que superan los 10,000 turnos.
- **Enmascaramiento de Datos (PII Protection):** En cumplimiento de las regulaciones de protección de datos médicos, el DNI de los pacientes es enmascarado automáticamente en la exportación mediante un algoritmo de backend antes de ser transmitido (ej: `34567890` -> `34***890`).

### 5.3 Consistencia de Métricas Financieras

Los datos de la interfaz están matemáticamente unificados para eliminar cualquier discrepancia:
- **Ticket Promedio Real:** Calculado en base a consultas efectivamente atendidas y completadas, discriminando aranceles específicos por cobertura:
  `Ticket Promedio = Suma de Monto de Consultas Completadas / Cantidad de Turnos Completados`
- **Tasa de Ausentismo Operativo:** Mide la eficiencia y pérdida por citas no asistidas:
  `Tasa de Ausentismo = (Turnos Cancelados Tardíamente / Total de Turnos Reservados) * 100`
- **Segmentación de Coberturas:** Distribución proporcional entre Obras Sociales, Prepagas (Flujo de liquidación diferido a 30/60 días) y consultas Particulares (Ingreso de caja directo inmediato).

## 6. Estructura de la Base de Datos (Esquema PostgreSQL)

El esquema relacional de PostgreSQL garantiza la integridad de datos mediante restricciones de clave externa (Foreign Keys) y migración resiliente.

```sql
-- Tabla de Usuarios y Credenciales
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'patient' CHECK (role IN ('patient', 'professional', 'collaborator_restricted'))
);

-- Tabla de Turnos con Campos de Facturación AFIP
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    paciente_dni VARCHAR(20) NOT NULL,
    paciente_nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(30) DEFAULT 'Confirmado' CHECK (estado IN ('Confirmado', 'Pendiente', 'Cancelado', 'Completado')),
    tipo_cobertura VARCHAR(50) DEFAULT 'particular' NOT NULL,
    precio_consulta NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    cae_number VARCHAR(14) DEFAULT NULL,
    fecha_facturacion TIMESTAMP DEFAULT NULL,
    profesional_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    profesional VARCHAR(100) NOT NULL
);
```

## 7. Estrategia de Testing Automatizado (Playwright)

El aseguramiento de la calidad y de las reglas de negocio críticas se realiza mediante una suite de pruebas End-to-End y de integración de alto rendimiento con Playwright.

### 7.1 Caso de Uso Crítico Evaluado: Verificación de Rol (RBAC - Escenario C)

Para evitar vulnerabilidades de tipo IDOR o fuga de datos financieros corporativos de la clínica, el test en `tests/rbac_export.spec.js` simula una petición de API para verificar que un usuario con rol de `patient` reciba estrictamente una respuesta HTTP 403 Forbidden al intentar consumir el endpoint de exportación sensible `/api/stats/export`.

```text
Test de Playwright (RBAC Validation)
   │
   ├─ 1. Genera token JWT simulado de Paciente
   ├─ 2. Dispara petición HTTP GET a: /api/stats/export?range=year
   ├─ 3. Express ejecuta middleware de autenticación y validación de rol
   ├─ 4. Express el rechazo con HTTP 403 (Acceso Denegado)
   └─ 5. Assert: expect(response.status()).toBe(403) -> PASSED (Verde)
```

### 7.2 Comandos de Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas en modo headless (consola)
npx playwright test

# Ejecutar pruebas visualizando el navegador y debugger (UI Mode)
npx playwright test --ui

# Generar reporte de cobertura y trazas tras un fallo
npx playwright show-report
```

## 8. Configuración e Instalación del Entorno

### 8.1 Requisitos Previos

- **Node.js:** Versión 18.0 o superior instalada.
- **PostgreSQL:** Instancia local (Puerto por defecto 5432 o el asignado en el script 5433).

### 8.2 Clonado y Despliegue de Dependencias

```bash
# 1. Clonar el repositorio
git clone <URL_REPOSITORIO>
cd medsmart-data-saas

# 2. Instalar dependencias del proyecto
npm install

# 3. Configurar variables de entorno (.env) en el directorio /server
# Crear archivo server/.env con los siguientes parámetros:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/turnos_medicos_db"
JWT_SECRET="tu_clave_secreta_jwt_de_firma"
PORT=3001
```

### 8.3 Sembrado Masivo de Datos de Prueba (Seeding)

Para poblar la base de datos con 621 profesionales, 100 pacientes y 90 turnos históricos realistas distribuidos en el mes actual de Julio de 2026 para el Dr. Carlos Méndez:

```bash
# Ejecutar migración de columnas y siembra de base de datos
node server/seed.js
```

### 8.4 Ejecución del Entorno de Desarrollo

Para arrancar el frontend de React y el backend de Express simultáneamente:

```bash
npm run dev:full
```

## 9. Credenciales de Acceso para Pruebas (Evaluación)

Para revisar e interactuar con el Dashboard totalmente poblado con métricas dinámicas, gráficos cargados e historial de consultas de demostración, inicie sesión en la plataforma con las siguientes credenciales de prueba preconfiguradas:

**Perfil Profesional (Dr. Carlos Méndez)**
- **Email:** carlos.mendez@turnosar.com
- **Contraseña:** password123
- **Rol:** professional
- **Contexto de demostración:** 90 turnos históricos distribuidos en 2026, con heatmap de capacidad activa, ingresos consolidados y módulo de facturación disponible para "Completar y Emitir CAE" sobre los pacientes de la lista de Julio de 2026.

## 10. Plan de Despliegue de Costo Fijo (Producción)

Para garantizar un margen de rentabilidad óptimo en un entorno SaaS real, se evita el uso de infraestructuras serverless con costos variables de consumo. Se utiliza un modelo de despliegue sobre un Servidor Privado Virtual (VPS) administrado con contenedores de Docker mediante el panel de control Docploy:

```text
[ Servidor VPS - Tarifa Plana ]
   │
   ├─► Contenedor 1: Panel Docploy (Despliegue GitOps continuo)
   ├─► Contenedor 2: Aplicación Frontend (React en Vercel o Docker)
   ├─► Contenedor 3: API Backend Express (Render o VPS Docker)
   └─► Contenedor 4: Base de Datos PostgreSQL (Supabase Cloud en puerto 6543)
```

## 11. Línea de Desarrollo Futura (Roadmap)

**Fase 1: Automatización Avanzada (Próximo Sprint)**
- **Notificaciones Push por WhatsApp:** Integración con la API de Twilio para enviar recordatorios dinámicos de citas 24 horas antes, disminuyendo el ausentismo un 15% adicional.
- **Pasarela de Pago de Aranceles (Copagos):** Integración con MercadoPago o Stripe para cobros inmediatos de seña y validaciones de tarjetas en tiempo real.

**Fase 2: Inteligencia de Negocios y Optimización de Capacidad (SaaS Advanced)**
- **Motor de Sobreturnos Inteligente:** Algoritmo predictivo de Machine Learning que asigne sobreturnos automáticamente analizando la tasa de ausentismo histórica del día de la semana y especialidad del médico.
- **Módulo Whitelabel Premium:** Ocultamiento total de la marca de TurnosAR y uso de subdominios personalizados (`clinica.turnosar.com`) para planes Enterprise.

## 12. Autoría

- **Desarrolladora principal:** Virginia Alejandra Ponce
- **Tecnologías:** React 18, Node.js, Express, PostgreSQL, Playwright, Tailwind CSS.
- **LinkedIn:** [https://www.linkedin.com/in/poncevirginialej/](https://www.linkedin.com/in/poncevirginialej/)
- **Ubicación:** Argentina (Catamarca).
=======
# Sistema de Turnos Médicos AR (TurnosAR)

## Descripción

TurnosAR es una plataforma web que desarrollé para gestionar turnos médicos en Argentina. La idea surgió porque veo que muchos consultorios siguen usando agendas de papel o sistemas muy básicos, y los pacientes tienen que llamar o ir personalmente para sacar turnos.

La aplicación está pensada para que tanto los médicos como los pacientes puedan manejar las citas de forma digital, sin complicaciones.

### ¿Qué soluciona?

**Para los médicos**: No más agendas de papel, menos pacientes que no van, mejor organización del tiempo y más ganancias.

**Para los pacientes**: No más colas ni esperas, pueden reservar turnos cuando quieran, toda la info médica en un lugar.

**Para las clínicas**: Todo centralizado, mejor experiencia para el usuario y menos gastos operativos.

---

## Estado del Proyecto

> **IMPORTANTE**: Esta es una demo funcional que muestra lo que puede hacer el sistema.
> 
> **Objetivo**: Ser la plataforma principal de turnos médicos en Argentina.

---

## Tecnologías que uso

### Backend y Base de Datos
- **Node.js** - Para ejecutar JavaScript en el servidor
- **Express.js** - Framework web para las APIs
- **MongoDB** - Base de datos que escala bien
- **Mongoose** - Para modelar los datos
- **Axios** - Para hacer llamadas a APIs
- **CORS** - Para permitir peticiones desde otros dominios

### Frontend y UI
- **React 18** - Para construir la interfaz
- **Vite** - Empaquetador súper rápido
- **React Router DOM v7** - Para la navegación
- **Context API** - Para manejar el estado global

### Estilos y Diseño
- **TailwindCSS 3.4** - Framework CSS que me gusta mucho
- **PostCSS** - Para procesar CSS
- **Autoprefixer** - Para que funcione en todos los navegadores
- **Lucide React** - Iconos modernos y consistentes

### Notificaciones
- **React Toastify** - Para mostrar mensajes
- **SweetAlert2** - Alertas modales que se ven bien

### Herramientas de Desarrollo
- **ESLint** - Para que el código esté limpio
- **PostCSS** - Para CSS más avanzado
- **Vite** - Para desarrollo rápido

---

## Cómo está organizado

### Estructura de archivos
```
src/
├── components/          # Componentes que reutilizo
│   ├── Layout.jsx      # Layout principal
│   ├── ProfessionalLayout.jsx  # Layout para médicos
│   ├── ProfessionalSidebar.jsx # Barra lateral
│   └── UserAvatar.jsx  # Avatar del usuario
├── context/            # Estado global
│   ├── AppointmentContext.jsx  # Contexto de citas
│   └── UserContext.jsx         # Contexto de usuario
├── hooks/              # Hooks personalizados
│   └── useAppointmentContext.js # Hook para citas
├── pages/              # Páginas principales
└── services/           # APIs y servicios
```

---

## 🧪 Sistema de Testing Completo

### Tests Unitarios e Integración
- **Jest + React Testing Library** para componentes críticos
- **Cobertura automática** con reportes detallados
- **Tests de validación** para formularios y lógica de negocio
- **Mocks completos** para APIs y servicios externos

### Tests End-to-End (E2E)
- **Cypress** para flujos completos de usuario
- **Screenshots automáticos** de cada paso importante
- **Videos opcionales** de cada test para debugging
- **Tests de accesibilidad** y responsive design

### Documentación Automática
- **Storybook** para documentar componentes individuales
- **Screenshots automáticos** de cada estado del componente
- **Script de Node.js** para actualizar documentación
- **GitHub Actions** para automatización completa

### Comandos de Testing
```bash
# Tests unitarios
npm run test
npm run test:watch
npm run test:coverage

# Tests E2E
npm run test:e2e
npm run test:e2e:open
npm run test:e2e:headless

# Todos los tests
npm run test:all

# Storybook
npm run storybook
npm run build-storybook

# Generar documentación completa
npm run docs:generate
```

---

## Lo que ya funciona

### Gestión de Usuarios
- **Registro** con validaciones completas
- **Login** seguro y rápido
- **Perfiles diferentes** para pacientes y médicos
- **Datos personales** y preferencias

### Sistema de Pacientes
- **Login específico** con DNI y contraseña
- **Registro** con todas las validaciones
- **Dashboard del paciente** con pestañas
- **Solicitud de turnos** eligiendo provincia, clínica, especialidad y médico
- **Calendario** para elegir fecha y hora
- **Se guarda en la base** en `/pacientes` y `/turnos`

### Sistema de Turnos
- **Crear citas** con validaciones
- **Editar y cancelar** turnos
- **Ver detalles** de cada cita
- **Lista completa** con filtros
- **Gestionar turnos** por paciente

### Pasarela de Pago
- **Simulación completa** del proceso de compra
- **Formularios** de facturación y tarjeta
- **Validaciones en tiempo real**
- **Confirmación** de pago exitoso
- **Interfaz moderna** siguiendo estándares de UX

### Panel del Médico
- **Dashboard** con métricas importantes
- **Calendario integrado** para la agenda
- **Gestionar colaboradores** y equipo
- **Datos personales** y de cuenta
- **Configurar direcciones** del consultorio
- **Datos bancarios** para pagos

### Páginas Principales
- **Home** - Página principal con estadísticas
- **Dashboard** - Panel con métricas y resumen
- **Turnero** - Sistema de turnos
- **Pricing** - Planes y precios
- **FAQ** - Preguntas frecuentes
- **Contact** - Formulario de contacto
- **Free Trial** - Prueba gratis de 15 días

### Funcionalidades Avanzadas
- **Responsive** para todos los dispositivos
- **Navegación intuitiva** con breadcrumbs
- **Validaciones en tiempo real**
- **Notificaciones push** para recordatorios
- **Sistema de alertas** para confirmaciones

---

## Rutas del sistema

| Ruta | Descripción | Acceso |
|------|-------------|---------|
| `/` | Página principal | Público |
| `/login` | Login de usuarios | Público |
| `/registro` | Registro de usuarios | Público |
| `/dashboard` | Panel principal | Autenticado |
| `/patient-login` | Login de pacientes | Público |
| `/patient-register` | Registro de pacientes | Público |
| `/patient-dashboard` | Panel del paciente | Autenticado |
| `/turnero` | Gestión de turnos | Autenticado |
| `/payment-gateway` | Pasarela de pago | Autenticado |
| `/citas` | Lista de citas | Autenticado |
| `/citas/crear` | Crear cita | Autenticado |
| `/citas/:id` | Detalle de cita | Autenticado |
| `/citas/:id/editar` | Editar cita | Autenticado |
| `/profesional/*` | Panel del médico | Médico |
| `/precios` | Planes y tarifas | Público |
| `/faq` | Preguntas frecuentes | Público |
| `/contacto` | Formulario de contacto | Público |
| `/prueba-gratis` | Prueba gratis | Público |

---

## Diseño y UX

### Principios que sigo
- **Centrado en el usuario** con flujos que tengan sentido
- **Interfaz limpia** siguiendo tendencias actuales
- **Accesible** para todos
- **Responsive** que funcione en cualquier dispositivo

### Colores
- **Paleta azul** que transmite confianza médica
- **Buen contraste** para que se lea bien
- **Consistente** en toda la app

### Responsive
- **Mobile-first** para mejor experiencia en móvil
- **Breakpoints optimizados** para tablets y desktop
- **Navegación que se adapta** al dispositivo

---

## Cómo instalarlo

### Requisitos
- Node.js 18+ 
- npm o yarn
- MongoDB (local o Atlas)

### Instalación
```bash
# Clonar el repo
git clone [URL_DEL_REPO]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev
```

### Scripts disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linting del código
```

---

## Objetivos del sistema

- **20,000+ médicos** usando TurnosAR en Argentina
- **14,000,000+ turnos** por año
- **10,000,000+ historias clínicas** gestionadas
- **60% menos** ausentismo de pacientes
- **40% más** rentabilidad del consultorio

---

## Evolución del Proyecto

### ¿Por qué cambié de Faker + mockDatabase a una API real?

Al principio del desarrollo, usé **Faker.js** y una **base de datos mock** para generar datos de prueba y prototipar rápidamente. Sin embargo, después de probar el sistema, me di cuenta de que:

**Faker.js no es necesario porque:**
- Los usuarios reales usan DNI como contraseña inicial
- No genero miles de usuarios de prueba
- Es un sistema de turnos, no un generador de datos
- Aumentaba el bundle size innecesariamente
- Agregaba complejidad sin beneficio real

**mockDatabase tampoco es necesario porque:**
- Voy a usar una **mock API funcional** con json-server
- Con Postman puedo verificar usuarios registrados
- Los datos son persistentes entre sesiones
- Es más realista para testing
- No hay duplicación de datos

**La solución final:**
- **Eliminé Faker** completamente del proyecto
- **Eliminé mockDatabase** y uso solo la API real
- **Bundle size reducido** de 1,056 kB a 608 kB (42% menos)
- **Arquitectura más simple** y mantenible
- **Una sola fuente de verdad** para los datos

### Próximamente
- **App móvil** para iOS y Android
- **Notificaciones push** avanzadas
- **Integración con sistemas** de salud existentes
- **API pública** para desarrolladores
- **Sistema de pagos** integrado

### Versión 2.0
- **Inteligencia artificial** para optimizar agendas
- **Telemedicina** con videollamadas
- **Analytics avanzados** para médicos
- **Integración con wearables** y dispositivos IoT

---

## Quién lo desarrolló

**Desarrollado por**: Virginia Alejandra Ponce  
**Tecnología**: React + Node.js + MongoDB  
**País**: Argentina

---

## Licencia

Este proyecto es una demo funcional para mostrar lo que puede hacer TurnosAR.

---

## Contribuir

Es un proyecto demo, pero las sugerencias y feedback son bienvenidos para futuras versiones.

---

## Contacto

Para más info sobre TurnosAR o consultas comerciales:
- **Email**: codeginny@gmail.com
- **Portfolio**: www.codeginnny.com
- **LinkedIn**: Virginia Ponce
>>>>>>> 5ec89ef952c27f22ad3b1e353dd79d3f2acc63a4
