const { query } = require('./config');

async function checkSchema() {
  try {
    console.log('🔍 Verificando esquema de la tabla turnos...');
    
    const result = await query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'turnos'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas de la tabla turnos:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (max_length: ${col.character_maximum_length})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchema();
