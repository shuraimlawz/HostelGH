import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const hostels = await prisma.hostel.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      university: true,
      isPublished: true,
    }
  });
  console.log(JSON.stringify(hostels, null, 2));
  await prisma.$disconnect();
}

main();
