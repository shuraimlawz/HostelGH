const fs = require('fs');
const path = 'c:/Users/issak/Desktop/HostelGH/apps/api/src/modules/admin/admin.service.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /async getAlerts\(\) \{[\s\S]*?\/\/ --- COMMAND CENTER METHODS ---/;
const replacement = `async getAlerts() {
    const counts = await this.getNotificationCounts();
    const alerts = [];
    if (counts.hostels > 0) {
      alerts.push({
        message: \`\${counts.hostels} hostels pending verification\`,
        type: "info",
      });
    }
    return alerts;
  }

  // --- COMMAND CENTER METHODS ---`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content);
