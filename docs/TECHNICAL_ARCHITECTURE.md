# Arquitectura Tecnica y Decisiones de Ingenieria

Este documento detalla las decisiones tecnicas criticas tomadas durante el desarrollo de TurnosAR para garantizar un sistema robusto, escalable y con una experiencia de usuario (UX) de baja friccion.

## Infraestructura Linux y Entorno de Desarrollo

### Protocolo de Gestion de Procesos
Para garantizar un entorno de desarrollo limpio, el script npm run dev:full implementa un orquestador que maneja procesos de PostgreSQL y Node.js.
- Patrón pkill robusto: Utilizamos pkill -f '[p]ostgres' para evitar que el comando se detenga a si mismo durante la ejecucion, asegurando una limpieza efectiva de conexiones previas.
- Puerto 5433: Movimos la instancia de desarrollo de PostgreSQL al puerto 5433. Esto evita colisiones con instalaciones de PostgreSQL a nivel de sistema que suelen ocupar el puerto 5432, facilitando el despliegue en cualquier maquina Linux sin configuracion previa.

## Integridad de Datos y Validaciones

### Sincronizacion Frontend-Backend (Zod)
Implementamos un sistema de validacion espejo entre React y Node.js para prevenir errores 400 Bad Request y garantizar datos de alta calidad:
- Longitud de Campos: Sincronizacion estricta de limites (Nombre: min 3, Telefono: min 10, DNI: 7-9 digitos).
- Tipado Estricto: Conversion de IDs a strings en el cliente para satisfacer esquemas de validacion Zod que no permiten nulos en campos opcionales.
- Sanitizacion de Telefonos: Uso de react-phone-input-2 con prefijo +54 fijo y bandera centrada, forzando un formato internacional valido desde la entrada del usuario.

## Logica de Negocio y UX

### Estrategia de Baja Friccion
Para maximizar la tasa de conversion (turnos reservados), aplicamos una logica de negocio permisiva pero segura:
- DNI Inalterable: Una vez registrado, el DNI del paciente es inamovible y se autocompleta en todas las funciones. Esto garantiza la integridad referencial en la base de datos.
- Reserva No Bloqueante: Permitimos que un paciente reserve un turno inmediatamente despues del registro, incluso si no ha completado datos secundarios (obra social, direccion). Los datos obligatorios se solicitan en un flujo continuo sin interrupciones.

## Esquema de Analiticas y Seeding

### Validacion de Dashboard con Datos Reales
Para demostrar la capacidad analitica del sistema (BI), desarrollamos un motor de seeding masivo:
- Cobertura Federal: Generacion automatica de 120 clinicas y 600 profesionales distribuidos federalmente en las 24 provincias de Argentina.
- Generacion de Historico: El perfil demo (Dr. Carlos Mendez - DNI 12345678) cuenta con 83 turnos distribuidos estrategicamente para validar graficos de rendimiento diario, semanal, mensual y anual.
- Metricas de Rendimiento: Los datos incluyen variaciones de inasistencia y facturacion para probar los algoritmos de deteccion de rentabilidad.
