const { query } = require('./config');

async function addBillingColumns() {
  try {
    console.log('🔄 Agregando columnas de facturación a tabla turnos...');
    
    // Agregar columnas si no existen
    await query(`
      ALTER TABLE turnos 
      ADD COLUMN IF NOT EXISTS cae_number VARCHAR(14),
      ADD COLUMN IF NOT EXISTS cae_vencimiento DATE,
      ADD COLUMN IF NOT EXISTS factura_url TEXT,
      ADD COLUMN IF NOT EXISTS tipo_comprobante VARCHAR(50),
      ADD COLUMN IF NOT EXISTS monto_facturado DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS fecha_facturacion TIMESTAMP
    `);
    
    console.log('✅ Columnas de facturación agregadas exitosamente');
    console.log('📋 Columnas agregadas:');
    console.log('   - cae_number: VARCHAR(14)');
    console.log('   - cae_vencimiento: DATE');
    console.log('   - factura_url: TEXT');
    console.log('   - tipo_comprobante: VARCHAR(50)');
    console.log('   - monto_facturado: DECIMAL(10, 2)');
    console.log('   - fecha_facturacion: TIMESTAMP');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar columnas:', error);
    process.exit(1);
  }
}

addBillingColumns();
