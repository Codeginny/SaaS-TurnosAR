# Smoke Test Plan - TurnosAR (Golden Path)

Este documento detalla el plan de pruebas principal (Golden Path) para garantizar que el flujo central de la aplicación TurnosAR funciona correctamente de principio a fin, asegurando la sincronización entre el frontend, backend y base de datos.

## Objetivo
Verificar que un paciente puede registrarse, agendar un turno y que el profesional pueda visualizarlo, gestionarlo y ver cómo ese turno impacta en sus estadísticas y facturación automática.

---

## 📝 Smoke Test Checklist

### Fase 1: Autenticación y Registro
- [ ] **Registro de Profesional:** 
  - Registrar un nuevo profesional médico desde `/api/register`.
  - Iniciar sesión exitosamente y acceder al dashboard profesional.
- [ ] **Registro de Paciente:**
  - Registrar un nuevo paciente desde `/api/patient-register`.
  - Iniciar sesión exitosamente y acceder al panel de turnos del paciente.

### Fase 2: Agendamiento de Turnos (Lado Paciente)
- [ ] **Crear un Turno:**
  - El paciente ingresa al formulario de solicitud de turnos.
  - El paciente selecciona al profesional registrado en la Fase 1.
  - El paciente confirma el turno para una fecha/hora específica.
- [ ] **Verificación de Turnos del Paciente:**
  - Confirmar que el turno aparece en la lista de turnos próximos del paciente (`/api/turnos/paciente/:id`).

### Fase 3: Gestión de Turnos (Lado Profesional)
- [ ] **Visualización en el Dashboard:**
  - El profesional inicia sesión.
  - Verifica que el nuevo turno aparece en la grilla/lista de turnos para "Hoy" o el periodo correspondiente.
- [ ] **Actualización de Estado del Turno:**
  - El profesional cambia el estado del turno (ej. de "Pendiente" a "Confirmado").
  - El profesional marca el turno como "Completado".

### Fase 4: Estadísticas Profesionales y Facturación (KPIs)
- [ ] **Impacto en Estadísticas (`ProfessionalStats`):**
  - Visualizar la sección de "Tu Consultorio" / Estadísticas.
  - Verificar que el contador de "Turnos Hoy" o "Turnos Completados" ha incrementado correctamente.
  - Verificar que los ingresos estimados/ganados en la tarjeta KPI reflejan el cobro de la consulta.
- [ ] **Financiación / Ocupación:**
  - Comprobar que los gráficos (Chart.js) reflejan la ocupación y/o ingresos asociados a la obra social/particular del paciente atendido.
- [ ] **Facturación Automática (AFIP/Simulación):**
  - Al completar el turno, verificar que el profesional puede acceder a la pre-visualización de la factura (`FacturaPreview`).
  - Corroborar que los datos del Emisor, Receptor e Importe son correctos.

---

## Criterios de Aceptación ✅
- Ningún paso debe lanzar errores 500 en el backend ni pantallas en blanco en el frontend.
- Los cambios de estado en los turnos deben reflejarse de inmediato (o tras refrescar) en la base de datos PostgreSQL.
- Las gráficas y estadísticas deben sumar valores coherentes, evitando `NaN` o valores indefinidos.
