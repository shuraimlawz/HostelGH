import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const force = process.env.FORCE_CREATE_ADMIN === 'true';
  if (!force) {
    console.error('This script is protected. Set FORCE_CREATE_ADMIN=true to run it.');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Password123!';
  const firstName = process.env.ADMIN_FIRSTNAME || 'Admin';
  const lastName = process.env.ADMIN_LASTNAME || 'User';

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`User with email ${email} already exists. Updating role and password.`);
    await prisma.user.update({
      where: { email },
      data: {
        role: UserRole.ADMIN,
        passwordHash,
        firstName,
        lastName,
        emailVerified: true,
        isActive: true,
      },
    });
  } else {
    console.log(`Creating admin user ${email}...`);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.ADMIN,
        firstName,
        lastName,
        emailVerified: true,
      },
    });
  }

  console.log('Admin user created/updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
