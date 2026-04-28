const fs = require('fs');

const path = 'c:/Users/issak/Desktop/HostelGH/apps/api/src/modules/admin/admin.service.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove updatePayoutStatus
content = content.replace(/async updatePayoutStatus[\s\S]*?async broadcastMessage/g, 'async broadcastMessage');

// Remove getPendingPayouts
content = content.replace(/async getPendingPayouts\(\) \{[\s\S]*?\}[\s]*async createInternalUser/g, 'async createInternalUser');

// Update getNotificationCounts
content = content.replace(/const \[pendingHostels, pendingPayouts\] = await Promise\.all\(\[\s*this\.prisma\.hostel\.count\(\{ where: \{ pendingVerification: true \} \}\),\s*this\.prisma\.payoutRequest\.count\(\{ where: \{ status: "PENDING" \} \}\),\s*\]\);\s*return \{\s*hostels: pendingHostels,\s*payouts: pendingPayouts,\s*total: pendingHostels \+ pendingPayouts,\s*\};/g, 'const pendingHostels = await this.prisma.hostel.count({ where: { pendingVerification: true } });\n    return {\n      hostels: pendingHostels,\n      payouts: 0,\n      total: pendingHostels,\n    };');

// Update getAlerts
content = content.replace(/if \(counts\.payouts > 0\) \{[\s\S]*?\}/g, '');

// Remove getDisputes
content = content.replace(/async getDisputes\(\) \{[\s\S]*?\}[\s]*async updateDisputeStatus/g, 'async updateDisputeStatus');

// Remove updateDisputeStatus
content = content.replace(/async updateDisputeStatus[\s\S]*?async getFinancialStats/g, 'async getFinancialStats');

// Update getFinancialStats
content = content.replace(/const \[totalVolume, escrowBalance, pendingPayouts\] = await Promise\.all\(\[[\s\S]*?\]\);[\s\S]*?return \{[\s\S]*?\};/g, 'const totalVolume = await this.prisma.payment.aggregate({\n      _sum: { amount: true },\n      where: { status: \'SUCCESS\' }\n    });\n    return {\n      totalVolume: totalVolume._sum.amount || 0,\n      escrowBalance: 0,\n      pendingPayouts: 0\n    };');

fs.writeFileSync(path, content);
console.log('admin service updated');
