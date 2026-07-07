const { query } = require('./database/config');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const ESPECIALIDADES = [
  'Cardiología',
  'Pediatría',
  'Clínica Médica',
  'Traumatología',
  'Ginecología'
];

const CLINICAS_POR_DEFECTO = [
  'Sanatorio Modelos',
  'Clínica Privada del Sol',
  'Hospital Italiano',
  'Sanatorio Güemes',
  'Centro Médico Integral'
];

const NOMBRES = ['Juan', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Carlos', 'Elena', 'Diego', 'Lucía', 'Martín', 'Sofía'];
const APELLIDOS = ['García', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Gómez', 'Díaz', 'Sánchez', 'Romero'];

function generarNombreAleatorio() {
  const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
  const apellido = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
  return `Dr(a). ${nombre} ${apellido}`;
}

const estados = ['confirmado', 'completado', 'cancelado'];
const pesos = [0.6, 0.3, 0.1];

const getRandomEstado = () => {
  const random = Math.random();
  if (random < pesos[0]) return estados[0];
  if (random < pesos[0] + pesos[1]) return estados[1];
  return estados[2];
};

// Distribución de tipos de cobertura: 45% Particular, 35% Obra Social, 20% Prepaga
const TIPOS_COBERTURA = ['particular', 'obra_social', 'prepaga'];
const PESOS_COBERTURA = [0.45, 0.35, 0.20];

const PRECIOS_POR_COBERTURA = {
  particular: 30000,
  obra_social: 22000,
  prepaga: 25000
};

const getRandomCobertura = () => {
  const random = Math.random();
  if (random < PESOS_COBERTURA[0]) return TIPOS_COBERTURA[0];
  if (random < PESOS_COBERTURA[0] + PESOS_COBERTURA[1]) return TIPOS_COBERTURA[1];
  return TIPOS_COBERTURA[2];
};

async function seed() {
  try {
    console.log('🔄 Iniciando generación masiva de datos...');

    // 1. Limpieza de base de datos
    console.log('🧹 Limpiando tablas...');
    await query('TRUNCATE TABLE turnos RESTART IDENTITY CASCADE');
    await query('TRUNCATE TABLE pacientes RESTART IDENTITY CASCADE');
    await query('TRUNCATE TABLE profesionales RESTART IDENTITY CASCADE');
    console.log('✅ Tablas limpiadas');

    // 2. Inserción de Profesionales Dinámicos
    console.log('📝 Insertando red médica (120 clínicas, 600 profesionales)...');
    const profesionalesIds = [];
    let dniCounter = 10000000;

    for (const provincia of PROVINCIAS) {
      // 5 Clínicas por provincia
      for (let i = 0; i < 5; i++) {
        const nombreClinica = `${CLINICAS_POR_DEFECTO[i]} ${provincia}`;
        
        // 1 Profesional por cada especialidad
        for (const especialidad of ESPECIALIDADES) {
          dniCounter++;
          const nombre = generarNombreAleatorio();
          const email = `doc${dniCounter}@turnosar.com`;
          const password = await bcrypt.hash('password123', SALT_ROUNDS);
          const telefono = '+54 11 4456-' + Math.floor(1000 + Math.random() * 9000);

          const result = await query(
            `INSERT INTO profesionales (dni, nombre, email, telefono, especialidad, clinica, provincia, ciudad, password) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING id, nombre, especialidad, clinica, provincia`,
            [dniCounter, nombre, email, telefono, especialidad, nombreClinica, provincia, provincia, password]
          );

          profesionalesIds.push(result.rows[0]);
        }
      }
    }
    console.log(`✅ ${profesionalesIds.length} profesionales genéricos creados`);

    // 3. Usuario Específico: Dr. Carlos Méndez
    console.log('⭐ Creando usuario de prueba: Dr. Carlos Méndez...');
    const carlosDni = 12345678;
    const carlosEmail = 'carlos.mendez@turnosar.com';
    const carlosPassword = await bcrypt.hash('password123', SALT_ROUNDS);
    
    const carlosResult = await query(
      `INSERT INTO profesionales (dni, nombre, email, telefono, especialidad, clinica, provincia, ciudad, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, nombre, especialidad, clinica, provincia, ciudad`,
      [carlosDni, 'Dr. Carlos Méndez', carlosEmail, '+54 383 412-3456', 'Cardiología', 'Sanatorio Pasteur Catamarca', 'Catamarca', 'San Fernando del Valle de Catamarca', carlosPassword]
    );
    const carlos = carlosResult.rows[0];
    console.log(`✅ Dr. Carlos Méndez creado exitosamente.`);
    profesionalesIds.push(carlos);

    // 4. Inserción de Médicos Particulares (Consultorios)
    console.log('🏘️ Insertando 20 profesionales independientes (Consultorios)...');
    const CALLES = ['Av. Belgrano', 'San Martín', 'Av. Rivadavia', 'Mitre', 'Sarmiento', 'Av. Corrientes', 'Calle 25 de Mayo'];
    
    for (let i = 0; i < 20; i++) {
      dniCounter++;
      const provincia = PROVINCIAS[i % PROVINCIAS.length];
      const especialidad = ESPECIALIDADES[i % ESPECIALIDADES.length];
      const calle = CALLES[i % CALLES.length];
      const altura = Math.floor(Math.random() * 2000) + 100;
      const clinicaParticular = `Consultorio - ${calle} ${altura}`;
      
      const nombre = generarNombreAleatorio();
      const email = `part${dniCounter}@turnosar.com`;
      const password = await bcrypt.hash('password123', SALT_ROUNDS);
      const telefono = '+54 11 5' + Math.floor(1000000 + Math.random() * 9000000);

      const res = await query(
        `INSERT INTO profesionales (dni, nombre, email, telefono, especialidad, clinica, provincia, ciudad, password) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id, nombre, especialidad, clinica, provincia`,
        [dniCounter, nombre, email, telefono, especialidad, clinicaParticular, provincia, provincia, password]
      );
      profesionalesIds.push(res.rows[0]);
    }
    console.log('✅ 20 Consultorios particulares creados');

    // 4. Crear pacientes ficticios
    console.log('📝 Insertando 100 pacientes ficticios...');
    const pacientesIds = [];
    for (let i = 0; i < 100; i++) {
      const pacienteDni = 30000000 + i;
      const pPassword = await bcrypt.hash('password123', SALT_ROUNDS);
      const result = await query(
        `INSERT INTO pacientes (dni, password, nombre, email) VALUES ($1, $2, $3, $4) RETURNING id, dni, nombre, email`,
        [pacienteDni, pPassword, `Paciente ${i+1}`, `paciente${i+1}@example.com`]
      );
      pacientesIds.push(result.rows[0]);
    }

    // 5. Turnos Históricos para Dr. Carlos Méndez (Dashboard Testing)
    console.log('📅 Generando historial analítico para Dr. Méndez...');
    const hoy = new Date();
    const crearTurno = async (diasAtras, horaNum, paciente, estadoForzado = null) => {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - diasAtras);
      const hora = `${horaNum}:00`;
      const estado = estadoForzado || getRandomEstado();
      const tipoCobertura = getRandomCobertura();
      const precioConsulta = PRECIOS_POR_COBERTURA[tipoCobertura];
      await query(
        `INSERT INTO turnos (paciente_id, paciente_dni, paciente_nombre, paciente_email, paciente_telefono, provincia, clinica, especialidad, profesional, fecha, hora, estado, precio_consulta, tipo_cobertura, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)`,
        [paciente.id, paciente.dni, paciente.nombre, paciente.email, '+54 11 1234-5678', carlos.provincia, carlos.clinica, carlos.especialidad, carlos.nombre, fecha, hora, estado, precioConsulta, tipoCobertura]
      );
    };

    // Hoy (10 turnos - 2 Pendientes, 6 Confirmados, 2 Cancelados)
    // Horario laboral de 8:00 a 16:00
    await crearTurno(0, 8, pacientesIds[0], 'pendiente');
    await crearTurno(0, 9, pacientesIds[1], 'confirmado');
    await crearTurno(0, 10, pacientesIds[2], 'confirmado');
    await crearTurno(0, 11, pacientesIds[3], 'cancelado');
    await crearTurno(0, 12, pacientesIds[4], 'confirmado');
    await crearTurno(0, 13, pacientesIds[5], 'confirmado');
    await crearTurno(0, 14, pacientesIds[6], 'pendiente');
    await crearTurno(0, 14, pacientesIds[7], 'cancelado'); // Mismo horario simulando sobreturno cancelado
    await crearTurno(0, 15, pacientesIds[8], 'confirmado');
    await crearTurno(0, 16, pacientesIds[9], 'confirmado');

    // Última Semana (10 turnos - algunos pacientes se repiten para simular fidelización)
    for (let i = 0; i < 10; i++) {
      // Reutilizar pacientes 0-2 como recurrentes (ya tuvieron turno hoy)
      const pacienteIdx = i < 3 ? i : 3 + i;
      await crearTurno(Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 8) + 9, pacientesIds[pacienteIdx]);
    }

    // Último Mes (20 turnos - mezcla de nuevos y recurrentes)
    for (let i = 0; i < 20; i++) {
      // 30% recurrentes (reusar pacientes anteriores), 70% nuevos
      const pacienteIdx = Math.random() < 0.3 ? Math.floor(Math.random() * 13) : 13 + i;
      await crearTurno(Math.floor(Math.random() * 21) + 8, Math.floor(Math.random() * 8) + 9, pacientesIds[pacienteIdx]);
    }

    // Histórico de Últimos 6 Meses (50 turnos - 70% Conf, 20% Pend, 10% Canc)
    // Para que los meses de Nov a Abr tengan datos y la facturación crezca
    const historicalStatuses = [
      ...Array(35).fill('completado'), // 70% Completado (se factura)
      ...Array(10).fill('pendiente'),  // 20% Pendiente
      ...Array(5).fill('cancelado')    // 10% Cancelado
    ];
    // Mezclar aleatoriamente los estados
    historicalStatuses.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 50; i++) {
      // Distribuidos en los últimos 180 días (6 meses)
      const diasAtras = Math.floor(Math.random() * 180) + 1;
      const pacienteIdx = Math.floor(Math.random() * 33) + 10;
      await crearTurno(diasAtras, Math.floor(Math.random() * 8) + 8, pacientesIds[pacienteIdx], historicalStatuses[i]);
    }
    console.log(`✅ 90 Turnos generados para Dr. Méndez.`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n=====================================');
    console.log('📋 CREDENCIALES DE ACCESO DE PRUEBA:');
    console.log('=====================================');
    console.log(`👤 Profesional Analítico:`);
    console.log(`   Nombre: ${carlos.nombre}`);
    console.log(`   DNI: ${carlosDni}`);
    console.log(`   Email: ${carlosEmail}`);
    console.log(`   Contraseña: password123`);
    console.log('=====================================');
    console.log('💡 La base de datos tiene ahora 120 clínicas y 600 médicos distribuidos por todo el país.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
