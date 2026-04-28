import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up database for production...');

  // Order matters due to foreign key constraints
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.hostelFacility.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  
  // Note: We keep the Users for now, or we can wipe non-admins
  // await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });

  console.log('✅ Database cleared of all seeded information.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
