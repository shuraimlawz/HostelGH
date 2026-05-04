const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const hostels = await prisma.hostel.findMany({
    select: { id: true, name: true, isPublished: true, ownerId: true }
  });
  
  console.log('All Hostels:');
  hostels.forEach(h => {
    console.log(`- [${h.id}] ${h.name} (Published: ${h.isPublished}) Owner: ${h.ownerId}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
