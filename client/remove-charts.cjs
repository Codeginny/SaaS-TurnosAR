const fs = require('fs');
let lines = fs.readFileSync('./src/pages/Dashboard.jsx', 'utf8').split('\n');
// Delete lines 977 to 1120 (0-indexed)
lines.splice(977, 1120 - 977 + 1);
fs.writeFileSync('./src/pages/Dashboard.jsx', lines.join('\n'));
