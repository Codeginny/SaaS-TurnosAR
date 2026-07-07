const { query } = require('./database/config');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Datos de profesionales argentinos
const profesionales = [
  {
    nombre: 'Dr. Carlos Méndez',
    email: 'carlos.mendez@turnosar.com',
    telefono: '1145567890',
    especialidad: 'Cardiología',
    clinica: 'Clínica del Sol'
  },
  {
    nombre: 'Dra. María González',
    email: 'maria.gonzalez@turnosar.com',
    telefono: '1145567891',
    especialidad: 'Dermatología',
    clinica: 'Sanatorio Guemes'
  },
  {
    nombre: 'Dr. Juan Pérez',
    email: 'juan.perez@turnosar.com',
    telefono: '1145567892',
    especialidad: 'Pediatría',
    clinica: 'Hospital Italiano'
  },
  {
    nombre: 'Dra. Ana Rodríguez',
    email: 'ana.rodriguez@turnosar.com',
    telefono: '1145567893',
    especialidad: 'Ginecología',
    clinica: 'Clínica del Sol'
  },
  {
    nombre: 'Dr. Roberto Fernández',
    email: 'roberto.fernandez@turnosar.com',
    telefono: '1145567894',
    especialidad: 'Traumatología',
    clinica: 'Sanatorio Guemes'
  },
  {
    nombre: 'Dra. Laura López',
    email: 'laura.lopez@turnosar.com',
    telefono: '1145567895',
    especialidad: 'Oftalmología',
    clinica: 'Hospital Italiano'
  },
  {
    nombre: 'Dr. Miguel Sánchez',
    email: 'miguel.sanchez@turnosar.com',
    telefono: '1145567896',
    especialidad: 'Neurología',
    clinica: 'Clínica del Sol'
  },
  {
    nombre: 'Dra. Carolina Martínez',
    email: 'carolina.martinez@turnosar.com',
    telefono: '1145567897',
    especialidad: 'Psiquiatría',
    clinica: 'Sanatorio Guemes'
  },
  {
    nombre: 'Dr. Alejandro Gómez',
    email: 'alejandro.gomez@turnosar.com',
    telefono: '1145567898',
    especialidad: 'Otorrinolaringología',
    clinica: 'Hospital Italiano'
  },
  {
    nombre: 'Dra. Valentina Díaz',
    email: 'valentina.diaz@turnosar.com',
    telefono: '1145567899',
    especialidad: 'Endocrinología',
    clinica: 'Clínica del Sol'
  }
];

async function seedProfessionals() {
  try {
    console.log('🔄 Iniciando seed de profesionales...');

    // Limpiar tablas (TRUNCATE)
    console.log('🧹 Limpiando tablas...');
    await query('TRUNCATE TABLE turnos RESTART IDENTITY CASCADE');
    console.log('✅ Tabla turnos limpiada');
    
    await query('TRUNCATE TABLE profesionales RESTART IDENTITY CASCADE');
    console.log('✅ Tabla profesionales limpiada');

    // Insertar profesionales
    console.log('📝 Insertando profesionales...');
    const idsRegistrados = [];

    for (const prof of profesionales) {
      // Encriptar contraseña (usamos el email como contraseña por defecto)
      const password = prof.email.split('@')[0]; // Usar parte del email como contraseña
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await query(
        `INSERT INTO profesionales (nombre, email, telefono, especialidad, password) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, nombre, especialidad`,
        [prof.nombre, prof.email, prof.telefono, prof.especialidad, hashedPassword]
      );

      idsRegistrados.push({
        id: result.rows[0].id,
        nombre: result.rows[0].nombre,
        especialidad: result.rows[0].especialidad,
        clinica: prof.clinica,
        password: password // Contraseña sin encriptar para referencia
      });

      console.log(`✅ Registrado: ${prof.nombre} - ${prof.especialidad} (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('=====================================');
    
    idsRegistrados.forEach((prof, index) => {
      console.log(`\n${index + 1}. ${prof.nombre}`);
      console.log(`   ID: ${prof.id}`);
      console.log(`   Especialidad: ${prof.especialidad}`);
      console.log(`   Clínica: ${prof.clinica}`);
      console.log(`   Email: ${prof.email}`);
      console.log(`   Contraseña: ${prof.password}`);
    });

    console.log('\n=====================================');
    console.log('💡 Podés usar estos IDs para crear turnos de prueba');
    console.log('💡 La contraseña es la parte antes del @ del email');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedProfessionals();
