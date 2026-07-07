const fs = require('fs');
let code = fs.readFileSync('./src/pages/Dashboard.jsx', 'utf8');
code = code.replace('    </div>\n  );\n};', '    </div>\n  </div>\n  );\n};');
fs.writeFileSync('./src/pages/Dashboard.jsx', code);
