import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

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

    // 2. Users (Admin Only)
    console.log("Creating admin user...");
    await prisma.user.create({
        data: {
            email: "ramosnewz@gmail.com",
            passwordHash,
            role: UserRole.ADMIN,
            firstName: "Shuraim",
            lastName: "Administrator",
            emailVerified: true,
        },
    });

    console.log("Cleanup and Admin creation complete!");

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
