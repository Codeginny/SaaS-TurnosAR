const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('./src/pages/Dashboard.jsx', 'utf8');
try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parse successful!');
} catch (e) {
  console.log('Parse error at line:', e.loc.line, 'column:', e.loc.column);
  console.log(e.message);
}
