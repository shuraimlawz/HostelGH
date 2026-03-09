import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Safety: require explicit opt-in to run destructive seed
if (process.env.FORCE_SEED !== "true") {
    console.error("Seeding blocked: set FORCE_SEED=true to run this seed (prevents accidental data loss).");
    process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
    console.log("Starting robust seeding...");

    // 1. Cleanup
    console.log("Cleaning up database...");
    await prisma.payment.deleteMany();
    await prisma.bookingItem.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hostel.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash("Password123!", 12);

    // 2. Users (Admin + Test accounts)
    console.log("Creating users...");

    // Admin user
    await prisma.user.create({
        data: {
            email: "ramosnewz@gmail.com",
            passwordHash,
            role: UserRole.ADMIN,
            firstName: "Shuraim",
            lastName: "Administrator",
            emailVerified: true,
            isActive: true,
        },
    });

    // Test TENANT account (for testing on Android)
    await prisma.user.create({
        data: {
            email: "tenant@example.com",
            passwordHash,
            role: UserRole.TENANT,
            firstName: "Test",
            lastName: "Tenant",
            emailVerified: true,
            isActive: true,
            isOnboarded: true,
        },
    });

    // Test OWNER account (for testing hostel management)
    await prisma.user.create({
        data: {
            email: "owner@example.com",
            passwordHash,
            role: UserRole.OWNER,
            firstName: "Test",
            lastName: "Owner",
            emailVerified: true,
            isActive: true,
            isOnboarded: true,
        },
    });

    console.log("Cleanup and user creation complete!");

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
