# Matriz de Capacidad Operativa (CapacityHeatmap)

## Descripción

El CapacityHeatmap es una herramienta de Business Intelligence que permite a los profesionales de la salud visualizar la ocupación de su agenda en una matriz de 7 días x 8 horas, basada en los datos históricos de los últimos 90 días.

## Funcionalidad

### Visualización
- **Matriz**: 7 días (Domingo a Sábado) x 8 horas (9:00 - 17:00)
- **Color Codificado**:
  - 🟢 Verde: Ocupación < 50% (subutilizado)
  - 🟡 Amarillo: Ocupación 50-75% (óptimo)
  - 🔴 Rojo: Ocupación > 75% (saturado)
- **Tooltips**: Al pasar el mouse sobre cada celda, muestra:
  - Día y hora específicos
  - Porcentaje de ocupación
  - Sugerencia de acción optimizada

### Cálculo de Ocupación

```javascript
CAPACIDAD_MÁXIMA = 2 turnos por hora

ocupación = (turnos_realizados / CAPACIDAD_MÁXIMA) * 100
```

### Sugerencias de Acción

**Ocupación < 50% (Verde)**
- "Considera agregar más turnos en este horario"
- "Promociona este horario para aumentar demanda"

**Ocupación 50-75% (Amarillo)**
- "Horario en rango óptimo"
- "Mantener capacidad actual"

**Ocupación > 75% (Rojo)**
- "Considera ampliar horarios o contratar personal adicional"
- "Evalúa redistribución de turnos"

## API Endpoint

```
GET /api/stats/capacity?periodo=90dias
```

### Parámetros
- `periodo` (opcional): Días de histórico a analizar (default: 90)
- `profesional` (opcional): Nombre del profesional (extraído de JWT si no se proporciona)

### Respuesta
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
    // ... más celdas
  ]
}
```

## Valor de Negocio

### Optimización de Ingresos
- Identifica horarios subutilizados para agregar más turnos
- Maximiza el uso del espacio físico del consultorio

### Gestión de Demanda
- Detecta picos de demanda para considerar contratación de personal adicional
- Permite planificación estratégica de recursos

### Toma de Decisiones
- Visualización clara de patrones de ocupación por día y hora
- Datos históricos para decisiones informadas

## Implementación Técnica

### Componente Frontend
- **Archivo**: `client/src/components/CapacityHeatmap.jsx`
- **Librería**: Recharts para visualización
- **Estado**: React useState para datos de matriz

### Backend
- **Endpoint**: `/api/stats/capacity`
- **Controller**: `statsController.js`
- **Query**: SQL con GROUP BY por día y hora

### Query SQL
```sql
SELECT 
  EXTRACT(DOW FROM fecha) as dia_numero,
  EXTRACT(HOUR FROM hora) as hora,
  COUNT(*) as turnos
FROM turnos
WHERE profesional = $1
  AND fecha >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY dia_numero, hora
ORDER BY dia_numero, hora;
```

## Consideraciones de Seguridad

- El endpoint requiere autenticación JWT
- Solo devuelve datos del profesional autenticado
- No expone información de otros profesionales
- Los datos son agregados, no individuales

## Limitaciones

- El análisis se basa en datos históricos, no proyecciones futuras
- La CAPACIDAD_MÁXIMA de 2 turnos por hora es configurable
- Los datos de pacientes individuales no se muestran en el heatmap
