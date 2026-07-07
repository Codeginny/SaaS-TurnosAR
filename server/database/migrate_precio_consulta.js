const { query } = require('./config');

async function migratePrecioConsulta() {
  try {
    console.log('🔄 Iniciando migración de precio_consulta...');

    // Agregar columna precio_consulta si no existe
    await query(`
      ALTER TABLE turnos 
      ADD COLUMN IF NOT EXISTS precio_consulta NUMERIC(10, 2) DEFAULT 5000
    `);
    console.log('✅ Columna precio_consulta agregada');

    // Agregar índices para mejorar rendimiento (usando columna existente)
    await query(`CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_turnos_profesional ON turnos(profesional)`);
    console.log('✅ Índices creados');

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migratePrecioConsulta();
