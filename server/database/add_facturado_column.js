const { query } = require('./config');

async function addFacturadoColumn() {
  try {
    console.log('🔄 Agregando columna facturado a tabla turnos...');
    
    await query(`
      ALTER TABLE turnos 
      ADD COLUMN IF NOT EXISTS facturado BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Columna facturado agregada exitosamente');
    console.log('💡 Esta columna indica si el turno ya tiene comprobante fiscal emitido');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar columna facturado:', error);
    process.exit(1);
  }
}

addFacturadoColumn();
