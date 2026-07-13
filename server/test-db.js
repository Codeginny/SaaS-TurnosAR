const { pool } = require('./database/config');
async function test() {
  const res = await pool.query('SELECT * FROM pacientes WHERE dni = $1', [99887766]);
  console.log('Paciente:', res.rows);
  process.exit(0);
}
test();
