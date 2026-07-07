const { query } = require('./config');

async function alterTelefonoColumn() {
  try {
    console.log('🔄 Alterando columna telefono en tabla profesionales...');
    
    // Cambiar el tamaño de la columna telefono de varchar(15) a varchar(20)
    await query(`
      ALTER TABLE profesionales 
      ALTER COLUMN telefono TYPE VARCHAR(20)
    `);
    console.log('✅ Columna telefono alterada a VARCHAR(20)');
    
    // También cambiar en pacientes si existe
    try {
      await query(`
        ALTER TABLE pacientes 
        ALTER COLUMN telefono TYPE VARCHAR(20)
      `);
      console.log('✅ Columna telefono en pacientes alterada a VARCHAR(20)');
    } catch (err) {
      console.log('ℹ️ Columna telefono en pacientes ya tiene el tamaño correcto o no existe');
    }
    
    console.log('🎉 Alteración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al alterar columna:', error);
    process.exit(1);
  }
}

alterTelefonoColumn();
