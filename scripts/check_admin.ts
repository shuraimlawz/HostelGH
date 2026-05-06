import { PrismaClient } from '@prisma/client';

async function check() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hostelgh.com' }
    });
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User Details:', JSON.stringify(user, null, 2));
    }
  } catch (e) {
    console.error('Error during check:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
