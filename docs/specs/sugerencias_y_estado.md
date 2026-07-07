# Documento de Especificación y Estado (SRS) - TurnosAR

## 1. Análisis de Estado Físico

### 1.1 Diagnóstico de Error Frontend ("Unsupported color format")
Tras analizar `client/src/utils/Utils.js` y `ChartjsConfig.jsx`, se determinó la causa del error en runtime:
La función `adjustColorOpacity(color, opacity)` está diseñada para manejar formatos de color HEX (`#`), `hsl` y `oklch`. Sin embargo, si la función `getCssVariable` (que extrae las variables del `:root` del navegador) devuelve un formato `rgb()` o `rgba()` estándar de CSS, la función utilitaria no lo reconoce, arroja un `console.warn("Unsupported color format")` y devuelve el string mal formateado, lo que rompe el renderizado en los canvas de Chart.js.
**Solución requerida:** Expandir el regex o la lógica de `adjustColorOpacity` para soportar `rgb(r, g, b)` nativamente, o forzar que las variables de Tailwind en `index.css` estén estrictamente en formato HEX/HSL.

### 1.2 Lógicas Backend Pendientes (Uncommitted)
Al examinar los controladores, se detectaron modificaciones clave aún no confirmadas en Git:
- **`authController.js`:** Se agregó soporte completo para validación de `dni` (incluyendo su generación automática por compatibilidad hacia atrás), comprobación de DNI único (para evitar errores de duplicidad 409), y la inyección de un token JWT al finalizar el registro para implementar un "Auto-Login" inmediato.
- **`statsController.js`:** Se aplicó una corrección crítica (bug fix) de sintaxis de variables. En la línea 325, la variable `mixResult` fue renombrada correctamente a `mixFinanciacionResult`, lo cual soluciona errores fatales (undefined) al intentar calcular la métrica de cobertura.

---

## 2. Identificación de Brechas (Gaps) - Golden Path y Analíticas

Para culminar la certificación del "Golden Path" y habilitar la capa de datos offline:

### RF-001: Motor de Exportación a Excel/CSV
- **Descripción:** Creación del endpoint `/api/stats/export` en `statsController.js`. Este controlador debe recibir un rango de fechas, compilar las analíticas de turnos, facturación y ausentismo del médico, y formatearlo como un buffer binario (usando librerías como `exceljs` o `json2csv`) para su descarga directa.
- **Prioridad:** Alta.

### RF-002: Interfaz de Rango de Fechas Avanzado (Datepicker)
- **Descripción:** Implementación de un componente en React en el `Dashboard` que permita elegir granularidad temporal dinámica (Último mes, 3 meses, 6 meses, Año actual) y que conecte su estado directamente al Request del endpoint de exportación.
- **Prioridad:** Alta.

### RF-003: Certificación Transaccional del Golden Path
- **Descripción:** La fase 4 del archivo `SMOKE_TEST.md` (Facturación) requiere integración total entre la actualización del estado del turno en frontend y el trigger del servicio `billingService.js`. Falta enlazar el botón "Completar Turno" con la generación del CAE simulado para que los KPIs reflejen el ingreso real.
- **Prioridad:** Media.

---

## 3. Brainstorming de Mejoras (SaaS Premium)

Propuestas de funcionalidades para diferenciar a TurnosAR como un CRM médico integral:

### RF-004: Recordatorios Inteligentes por WhatsApp
- **Descripción:** Integración con APIs de mensajería (ej. Twilio, Meta) para disparar recordatorios automáticos 48 horas antes de la cita, permitiendo al paciente confirmar o cancelar con un solo tap (reduciendo la tasa de ausentismo).
- **Prioridad:** Alta.

### RF-005: Motor de Sobre-turnos y Urgencias (Overbooking Controlado)
- **Descripción:** Habilitar un flujo excepcional en el calendario profesional que permita encimar un paciente de urgencia sobre un turno existente sin romper la matriz de capacidad.
- **Prioridad:** Media.

### RF-006: Consultorio Virtual Integrado (Telemedicina)
- **Descripción:** Módulo WebRTC (ej. Jitsi/Daily.co) embebido en la plataforma. Al marcar un turno como "Videoconsulta", se genera un enlace seguro de único uso accesible desde el panel del paciente y del médico.
- **Prioridad:** Baja.

### RN-001: Motor de Retención Financiera
- **Descripción:** Regla de negocio estricta: Si un paciente cancela su reserva con menos de 24 horas de antelación, el sistema retendrá automáticamente el 20% del valor procesado en la pasarela de pagos, bloqueando reembolsos totales.

### RN-002: Límites de Capacidad Máxima
- **Descripción:** El sistema debe rechazar (HTTP 422) la creación de nuevos turnos regulares si un slot horario determinado (ej. Lunes 10:00 AM) supera el límite configurado de `MAX_CAPACITY_PER_HOUR` (2 pacientes/hora).

---


## 4. Requisitos No Funcionales

- **Seguridad (Sec-01):** El nuevo endpoint `/api/stats/export` debe heredar el middleware de autenticación (JWT). Es imperativo usar el ID decodificado del token (`req.user.id`) para la consulta SQL, previniendo cualquier tipo de ataque de alteración de referencias directas a objetos (IDOR).
- **Rendimiento (Perf-01):** La agregación de datos para exportaciones anuales (>5000 registros) no debe bloquear el Event Loop de Express. Se sugiere utilizar streams (`pg-query-stream`) o consultas materializadas.
- **Usabilidad (UI-01):** Al solicitar un reporte pesado en el dashboard, la interfaz debe bloquear el botón con un Loading Spinner para evitar inundación de peticiones concurrentes por impaciencia del usuario.
