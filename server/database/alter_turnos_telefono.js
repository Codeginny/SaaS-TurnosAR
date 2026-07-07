const { query } = require('./config');

async function alterTurnosTelefonoColumn() {
  try {
    console.log('🔄 Alterando columna paciente_telefono en tabla turnos...');
    
    // Cambiar el tamaño de la columna paciente_telefono de varchar(15) a varchar(20)
    await query(`
      ALTER TABLE turnos 
      ALTER COLUMN paciente_telefono TYPE VARCHAR(20)
    `);
    console.log('✅ Columna paciente_telefono alterada a VARCHAR(20)');
    
    console.log('🎉 Alteración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al alterar columna:', error);
    process.exit(1);
  }
}

alterTurnosTelefonoColumn();
