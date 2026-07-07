# Cambios Recientes - Abril 2026

Este documento documenta los cambios realizados en las últimas dos semanas que aún no están incluidos en la documentación principal.

---

## 27 de Abril, 2026

### 1. Corrección de Precios en seed.js

**Problema:**
El script `seed.js` generaba precios aleatorios entre $5,000 y $15,000, lo cual era inconsistente con la regla de negocio establecida de $30,000 fijos por consulta.

**Solución:**
- Eliminada la función `getRandomPrice()` que generaba precios aleatorios
- Reemplazada por constante `PRECIO_CONSULTA = 30000`
- Actualizados todos los turnos generados para usar el precio fijo de $30,000

**Archivos modificados:**
- `server/seed.js` (líneas 45-50, 287)

**Impacto:**
- Los datos de prueba ahora reflejan correctamente la regla de negocio
- Las estadísticas de ingresos ahora son consistentes con el precio real de consulta
- El mensaje de salida del seed ahora indica el precio fijo de $30,000

---

### 2. Localización de Días de Semana en Español

**Problema:**
El gráfico de barras de "Turnos por Día de la Semana" mostraba los días en inglés (Monday, Tuesday, Wednesday, etc.), lo cual no era apropiado para una aplicación en español.

**Solución:**
- Modificada la consulta SQL en `statsController.js` para usar `EXTRACT(DOW FROM fecha)` en lugar de `TO_CHAR(fecha, 'Day')`
- Agregado mapeo manual de días de la semana en español: `['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']`
- Eliminada la duplicación de la variable `turnosPorDia`

**Archivos modificados:**
- `server/controllers/statsController.js` (líneas 98-117)

**Impacto:**
- El gráfico de barras ahora muestra los días en español
- Mejora la experiencia de usuario para profesionales de habla hispana
- Consistencia con el resto de la aplicación en español

---

### 3. Ampliación de Datos de Prueba para Carlos Méndez

**Problema:**
Los datos de prueba eran insuficientes para visualizar variaciones en los gráficos de estadísticas al cambiar entre periodos (hoy, semana, mes, año).

**Solución:**
- Ampliados los turnos de 50 a 73 en total
- Distribución específica para Dr. Carlos Méndez:
  - 3 turnos de hoy (1 completado, 1 confirmado, 1 cancelado)
  - 20 turnos del mes actual
  - 30 turnos distribuidos en diferentes meses del año
  - 20 turnos para otros profesionales
- Corregido el error de índice de array usando módulo para no exceder el array de pacientes

**Archivos modificados:**
- `server/seed.js` (líneas 128-279)

**Impacto:**
- Ahora es posible ver variaciones significativas en los gráficos al cambiar de periodo
- Carlos Méndez tiene 53 turnos para análisis de gráficos
- Los datos están distribuidos en: hoy, este mes y este año
- Permite probar la funcionalidad de comparativa de crecimiento

---

### 4. Actualización del README.md

**Cambio:**
Reemplazado el contenido completo del README.md con un texto más profesional y orientado a negocio, destacando:
- Perfil profesional como estudiante avanzada de Análisis y Gestión de Datos
- Experiencia de 10 años en gestión de negocios
- Enfoque en Business Intelligence y rentabilidad
- Arquitectura técnica robusta
- Stack tecnológico moderno

**Archivos modificados:**
- `README.md` (contenido completo reemplazado)

**Impacto:**
- Documentación más alineada con el perfil profesional del desarrollador
- Enfoque en valor de negocio y rentabilidad
- Texto más conciso y directo para reclutadores y potenciales clientes

---

## Trazabilidad del Dato: Drill-down de Pacientes

**Arquitectura de Consistencia:**

El modal de drill-down de pacientes y los gráficos de estadísticas consumen el mismo endpoint `/api/stats/professional`, garantizando que los datos sean consistentes en toda la interfaz.

**Flujo de Datos:**
1. **Fuente Única**: El endpoint `/api/stats/professional` devuelve un objeto JSON con:
   - `turnosPorEstado`: Datos para gráficos de torta
   - `turnosPorDia`: Datos para gráfico de barras
   - `pacientes`: Lista detallada para modal de drill-down
   - `hoy`: Datos del día actual
   - `tasaAusentismo`: Métrica calculada

2. **Consumo en Frontend:**
   - **Gráficos**: Utilizan `turnosPorEstado` y `turnosPorDia` para visualizaciones
   - **Modal de Pacientes**: Utiliza `pacientes` para lista detallada
   - **KPIs**: Utilizan `hoy` y `tasaAusentismo` para indicadores

3. **Garantía de Integridad:**
   - Ambas vistas se actualizan simultáneamente al cambiar el periodo
   - Los IDs de pacientes son consistentes entre vistas
   - Los montos facturados provienen de la misma consulta SQL

**Beneficio para Reclutadores:**
Esta arquitectura demuestra comprensión de "Single Source of Truth" y diseño de sistemas escalables donde la consistencia de datos es crítica para la toma de decisiones financieras.

---

## Estado de Documentación

### ✅ COMPLETAMENTE DOCUMENTADO:
- Módulo de facturación AFIP-Ready (en ROADMAP.md)
- Tests unitarios (en README.md y ROADMAP.md)
- Migraciones de base de datos (en README.md y structure.sql)
- Arquitectura de base de datos (en README.md)
- Comandos de instalación y testing (en README.md)

### ✅ AHORA DOCUMENTADO (este archivo):
- Cambio de días de semana a español
- Ampliación de datos de seed.js
- Corrección de precio fijo en seed.js
- Actualización del README.md

### ⚠️ PARCIALMENTE DOCUMENTADO:
- CapacityHeatmap - Mencionado pero sin detalles técnicos
- Drill-down de pacientes - No documentado
- Comparativa de crecimiento - No documentado
- Lógica de 48 horas - Documentado pero sin ejemplos prácticos

### ❌ AÚN NO DOCUMENTADO:
- Integración de FacturaPreview en ProfessionalStats
- Estado actual de precios (ahora corregido)
- Detalles técnicos de CapacityHeatmap
- Detalles técnicos de drill-down de pacientes

---

## Próximos Pasos

Para completar la documentación, se recomienda:

1. **Documentar CapacityHeatmap:**
   - Explicar la lógica de cálculo de ocupación
   - Documentar los tooltips de sugerencias
   - Agregar ejemplos de uso

2. **Documentar Drill-down de Pacientes:**
   - Explicar el flujo de navegación
   - Documentar el modal de pacientes
   - Agregar capturas de pantalla

3. **Documentar Comparativa de Crecimiento:**
   - Explicar el cálculo del porcentaje
   - Documentar la lógica de comparación de periodos
   - Agregar ejemplos visuales

4. **Documentar Lógica de 48 Horas:**
   - Explicar con ejemplos prácticos
   - Documentar los diferentes escenarios
   - Agregar casos de uso reales

---

**Última actualización:** 27 de Abril, 2026
**Estado:** Documentación en proceso de mejora continua
