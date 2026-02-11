import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding...");
    const passwordHash = await bcrypt.hash("Password123!", 12);

    // Users
    const admin = await prisma.user.upsert({
        where: { email: "admin@hostelbook.test" },
        update: {},
        create: {
            email: "admin@hostelbook.test",
            passwordHash,
            role: UserRole.ADMIN,
            firstName: "System",
            lastName: "Admin",
            emailVerified: true,
        },
    });

    const owner = await prisma.user.upsert({
        where: { email: "owner@hostelbook.test" },
        update: {},
        create: {
            email: "owner@hostelbook.test",
            passwordHash,
            role: UserRole.OWNER,
            firstName: "Hostel",
            lastName: "Owner",
            emailVerified: true,
        },
    });

    const tenant = await prisma.user.upsert({
        where: { email: "tenant@hostelbook.test" },
        update: {},
        create: {
            email: "tenant@hostelbook.test",
            passwordHash,
            role: UserRole.TENANT,
            firstName: "Test",
            lastName: "Tenant",
            emailVerified: true,
        },
    });

    // Hostel
    const hostel = await prisma.hostel.create({
        data: {
            ownerId: owner.id,
            name: "Sunrise Hostel",
            description: "Affordable rooms near campus.",
            addressLine: "123 Campus Road",
            city: "Accra",
            region: "Greater Accra",
            country: "GH",
            isPublished: true,
            rooms: {
                create: [
                    {
                        name: "2-in-1",
                        description: "Two people per room",
                        capacity: 2,
                        totalUnits: 10,
                        pricePerTerm: 150000,
                        isActive: true,
                    },
                    {
                        name: "4-in-1",
                        description: "Four people per room",
                        capacity: 4,
                        totalUnits: 20,
                        pricePerTerm: 90000,
                        isActive: true,
                    },
                ],
            },
        },
    });

    console.log({
        admin: admin.email,
        owner: owner.email,
        tenant: tenant.email,
        hostel: hostel.name
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
