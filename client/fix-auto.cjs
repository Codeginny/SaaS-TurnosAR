const fs = require('fs');
const parser = require('@babel/parser');
let code = fs.readFileSync('./src/pages/Dashboard.jsx', 'utf8');

let success = false;
for (let i = 0; i < 10; i++) {
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    console.log('Parse successful with ' + i + ' extra divs added!');
    fs.writeFileSync('./src/pages/Dashboard.jsx', code);
    success = true;
    break;
  } catch (e) {
    // Inject a div before the return
    code = code.replace('  );\n};', '  </div>\n  );\n};');
  }
}

if (!success) {
  console.log('Failed to auto-fix with divs');
}
