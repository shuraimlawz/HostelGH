const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const hostels = await prisma.hostel.findMany({
    take: 5,
    select: { id: true, name: true, slug: true, isPublished: true }
  });
  
  console.log('Sample Hostels:', JSON.stringify(hostels, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
