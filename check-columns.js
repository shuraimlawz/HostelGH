const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const raw = await prisma.$queryRaw`SELECT * FROM "Hostel" LIMIT 1`;
    console.log('Column names:', Object.keys(raw[0] || {}));
  } catch (err) {
    console.error('Raw query failed:', err.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
