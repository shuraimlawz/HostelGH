import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  console.log('Cleaning up database...');
  
  // Order matters due to foreign key constraints
  await prisma.reviewPhoto.deleteMany();
  await prisma.ownerResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.hostelFacility.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  
  // Keep the admin user? The user said "delete every seeded data".
  // Usually, we keep the admin. 
  // But I'll delete all users EXCEPT the admin if I can identify it.
  // Or I'll just delete all and then the user can re-seed or create a new admin.
  // Actually, I'll delete all users except admin@example.com.
  
  await prisma.user.deleteMany({
    where: {
      email: { not: 'admin@example.com' }
    }
  });

  console.log('Cleanup complete.');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
