# Memoria de Desarrollo: Uso de Inteligencia Artificial

## 1. Introducción
El presente documento detalla la integración de herramientas de Inteligencia Artificial (IA) durante el ciclo de vida del desarrollo del sistema TurnosAR. El objetivo de su uso fue asistir en la depuración de código, optimización de algoritmos y diseño de la arquitectura de seguridad, garantizando estándares profesionales en la entrega del Producto Mínimo Viable (MVP).

## 2. Casos de Uso Documentados

### 2.1. Resolución de Errores Frontend: Configuración de Chart.js
Durante la fase de integración del panel de estadísticas (Dashboard), se presentó un error de tipo "Unsupported color format" en el renderizado de los gráficos de Chart.js. 

**Proceso iterativo con IA:**
Se analizó el componente `client/src/utils/Utils.js` y `ChartjsConfig.jsx`. La IA identificó rápidamente que la función utilitaria `adjustColorOpacity` estaba diseñada exclusivamente para manejar formatos HEX (`#`), `hsl` y `oklch`. Al extraer variables del `:root` del navegador (TailwindCSS) en formato `rgb()` nativo, la función fallaba, impidiendo la visualización de los datos. Se utilizó la asistencia para expandir la lógica de conversión de colores y garantizar compatibilidad multiplataforma.

### 2.2. Robustez del Backend: Validaciones Zod y Middlewares de Seguridad
Para asegurar la integridad de los datos transaccionales, se requería una capa de validación estricta antes de la persistencia en PostgreSQL, evitando el overhead de TypeScript pero manteniendo la robustez.

**Proceso iterativo con IA:**
Se diseñó de manera conjunta una arquitectura de seguridad multicapa basada en middlewares. La IA proporcionó patrones óptimos para:
- Interceptar y validar los esquemas de datos utilizando la librería `Zod` (ej. validación de formato DNI, correos y contraseñas).
- Sanitizar los datos en tiempo de ejecución (runtime), evitando inyecciones SQL.
- Implementar un sistema de interceptación de errores centralizado (`errorHandler`), garantizando respuestas HTTP consistentes (ej. 400 Bad Request o 409 Conflict) sin revelar trazas de pila sensibles al cliente.

## 3. Conclusión
La incorporación de la Inteligencia Artificial como asistente de desarrollo resultó ser una decisión técnica altamente efectiva. Permitió acelerar los tiempos de ideación y depuración del MVP, facilitando la implementación de patrones arquitectónicos seguros y eficientes. Este enfoque evidenció que es posible incrementar la velocidad de entrega sin sacrificar la mantenibilidad, escalabilidad ni la calidad del código fuente resultante.
