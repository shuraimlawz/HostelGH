const fs = require('fs');

const path = 'c:/Users/issak/Desktop/HostelGH/apps/api/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove Payouts
content = content.replace(/\/\/ --- PAYOUTS ---[\s\S]*?\/\/ --- COMMAND CENTER ENDPOINTS ---/g, '// --- COMMAND CENTER ENDPOINTS ---');

// Remove Disputes
content = content.replace(/@Get\("disputes"\)[\s\S]*?@Get\("financials"\)/g, '@Get("financials")');

// Remove second getAlerts which was inside the payouts block maybe?
// Let's just do a clean replace for the known chunks.

fs.writeFileSync(path, content);
console.log('admin controller updated');
