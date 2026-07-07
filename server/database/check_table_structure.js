const { query } = require('./config');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla turnos...');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'turnos'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas de la tabla turnos:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTableStructure();
