# Memoria de Desarrollo: TurnosAR

## 1. Introducción
El proyecto TurnosAR surge como una solución tecnológica frente a las problemáticas actuales en la administración de consultorios médicos. Se identificó que la gestión ineficiente de agendas, la dependencia de formatos analógicos (papel) y las altas tasas de ausentismo repercuten negativamente tanto en la calidad de atención al paciente como en la rentabilidad del profesional. El sistema busca digitalizar estos procesos, proporcionando una herramienta unificada que optimice la ocupación, automatice la gestión y facilite el análisis financiero de la práctica clínica.

## 2. Solución y Arquitectura Técnica
Para abordar el problema planteado de manera eficiente y escalable, se implementó una arquitectura Full-Stack robusta y contenerizada (Docker-ready). 
El servidor (Backend) se desarrolló utilizando Node.js con el framework Express.js, plataforma elegida por su capacidad para manejar flujos asíncronos y altos niveles de concurrencia de forma nativa. La persistencia y el modelado de la información médica se resolvieron mediante PostgreSQL, un motor relacional que garantiza la integridad referencial (ACID) esencial para el manejo de datos transaccionales. El entorno fue preparado para un despliegue inmediato mediante Docker y Docker Compose, facilitando la portabilidad del ecosistema.

## 3. Decisiones Técnicas
Durante la fase de diseño inicial, se evaluó la posibilidad de utilizar soluciones BaaS (Backend as a Service). Sin embargo, se optó finalmente por desarrollar una arquitectura relacional nativa propia, fundamentada en los siguientes criterios técnicos y de negocio:
- **Escalabilidad a Múltiples Instituciones:** Un esquema relacional propio (PostgreSQL) facilita el diseño de una arquitectura Multi-Tenant, imprescindible para agrupar clínicas y profesionales de manera aislada y segura.
- **Control de Concurrencia:** Permite un manejo eficiente sobre la concurrencia transaccional en horarios pico (reservas simultáneas de turnos).
- **Protección del Margen Comercial:** Se mitigó la dependencia o "vendor lock-in" con proveedores de BaaS, protegiendo los márgenes operativos a largo plazo al evitar sobrecostos variables basados en operaciones de lectura/escritura (documentos).

## 4. Bitácora de Desarrollo: Uso de Inteligencia Artificial
El ciclo iterativo de desarrollo integró diversas herramientas de Inteligencia Artificial (IA) en un rol de asistencia técnica ("copiloto"). Se registraron los siguientes hitos:

- **Diseño de Arquitectura con Antigravity:** Se empleó la asistencia de agentes avanzados como Antigravity para iterar sobre el diseño de la infraestructura base, el empaquetado de contenedores y las decisiones estructurales, asegurando buenas prácticas y un rápido Time-to-Market.
- **Resolución de Bugs en el Frontend (`ChartjsConfig.jsx`):** Se resolvió un error crítico de renderizado (`Unsupported color format`). Con la asistencia de la IA se identificó que la lógica de conversión no admitía formatos nativos `rgb()`/`rgba()` extraídos de las variables CSS de Tailwind. Se iteró la función utilitaria logrando compatibilidad total en el panel de BI.
- **Lógica de Middlewares y Validación (Zod):** Se implementó una capa de validación estricta y segura. Mediante análisis asistido, se reemplazaron validaciones manuales por esquemas centralizados de Zod acoplados a middlewares de Express. Esto robusteció la prevención de inyecciones SQL y unificó la salida de códigos HTTP (ej. errores 400 y 401).

## 5. Mejoras Futuras (Roadmap)
La arquitectura actual sienta las bases para las siguientes expansiones planificadas:
- **Motor Avanzado de Exportación a Excel:** Integración de reportes XLSX en streaming para conciliación bancaria y auditoría médica profunda.
- **Integración Automatizada vía WhatsApp:** Conexión con APIs de mensajería para el envío de recordatorios transaccionales (24-48 hs antes de la cita) a fin de reducir el sobre-agendamiento ineficiente.
- **Portal de Familiares/Tutores:** Desarrollo de control de acceso jerárquico para que tutores legales puedan administrar turnos e historiales médicos de pacientes dependientes.
