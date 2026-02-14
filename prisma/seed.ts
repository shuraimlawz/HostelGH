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

    // 2. Users
    console.log("Creating users...");
    const admin = await prisma.user.create({
        data: {
            email: "admin@hostelgh.com",
            passwordHash,
            role: UserRole.ADMIN,
            firstName: "System",
            lastName: "Administrator",
            emailVerified: true,
        },
    });

    const owners = await Promise.all([
        prisma.user.create({
            data: {
                email: "kwame.ansah@hostelgh.com",
                passwordHash,
                role: UserRole.OWNER,
                firstName: "Kwame",
                lastName: "Ansah",
                emailVerified: true,
            },
        }),
        prisma.user.create({
            data: {
                email: "abena.mensah@hostelgh.com",
                passwordHash,
                role: UserRole.OWNER,
                firstName: "Abena",
                lastName: "Mensah",
                emailVerified: true,
            },
        }),
    ]);

    const tenants = await Promise.all([
        prisma.user.create({
            data: {
                email: "kofi.addo@hostelgh.com",
                passwordHash,
                role: UserRole.TENANT,
                firstName: "Kofi",
                lastName: "Addo",
                emailVerified: true,
            },
        }),
        prisma.user.create({
            data: {
                email: "ekua.dapaah@hostelgh.com",
                passwordHash,
                role: UserRole.TENANT,
                firstName: "Ekua",
                lastName: "Dapaah",
                emailVerified: true,
            },
        }),
    ]);

    // 3. Hostels & Rooms
    console.log("Creating hostels and rooms...");
    const hostelData = [
        {
            ownerId: owners[0].id,
            name: "Lakeside Executive",
            description: "Premium student accommodation with high-speed internet and backup power.",
            addressLine: "Lakeside Link, near UG Gate",
            city: "Accra",
            region: "Greater Accra",
            university: "University of Ghana (Legon)",
            rooms: [
                { name: "1-in-1 Executive", capacity: 1, totalUnits: 5, pricePerTerm: 450000, description: "Private room with ensuite bath" },
                { name: "2-in-1 Premium", capacity: 2, totalUnits: 15, pricePerTerm: 280000, description: "Shared with 1 person, AC included" },
            ]
        },
        {
            ownerId: owners[1].id,
            name: "Garden City Residency",
            description: "Quiet and serene environment, perfect for engineering and medical students.",
            addressLine: "KNUST South Campus Road",
            city: "Kumasi",
            region: "Ashanti",
            university: "KNUST",
            rooms: [
                { name: "2-in-1 Classic", capacity: 2, totalUnits: 25, pricePerTerm: 220000 },
            ]
        },
        {
            ownerId: owners[0].id,
            name: "Sea Breeze Plaza",
            description: "Walking distance to the UCC campus.",
            addressLine: "Science Market Road",
            city: "Cape Coast",
            region: "Central",
            university: "University of Cape Coast (UCC)",
            rooms: [
                { name: "2-in-1 Ensuite", capacity: 2, totalUnits: 12, pricePerTerm: 200000 },
            ]
        },
        {
            ownerId: owners[1].id,
            name: "Pentecost Hall",
            description: "Affordable housing for students in Sowutuom.",
            addressLine: "Sowutuom Road",
            city: "Accra",
            region: "Greater Accra",
            university: "Pentecost University",
            rooms: [
                { name: "4-in-1 Basic", capacity: 4, totalUnits: 50, pricePerTerm: 120000 },
            ]
        },
        {
            ownerId: owners[0].id,
            name: "Ashesi Heights",
            description: "Modern facility overlooking the Ashesi campus.",
            addressLine: "Berekuso Hills",
            city: "Berekuso",
            region: "Eastern",
            university: "Presbyterian University Ghana",
            rooms: [
                { name: "Single Studio", capacity: 1, totalUnits: 8, pricePerTerm: 500000 },
            ]
        },
        {
            ownerId: owners[1].id,
            name: "GIMPA Gardens",
            description: "Conducive for postgraduate students.",
            addressLine: "Greenhill Road",
            city: "Accra",
            region: "Greater Accra",
            university: "GIMPA",
            rooms: [
                { name: "Double Suite", capacity: 2, totalUnits: 10, pricePerTerm: 350000 },
            ]
        }
    ];

    for (const data of hostelData) {
        await prisma.hostel.create({
            data: {
                ownerId: data.ownerId,
                name: data.name,
                description: data.description,
                addressLine: data.addressLine,
                city: data.city,
                region: data.region,
                university: data.university,
                isPublished: true,
                rooms: {
                    create: data.rooms.map(room => ({
                        name: room.name,
                        capacity: room.capacity,
                        totalUnits: room.totalUnits,
                        pricePerTerm: room.pricePerTerm,
                        description: room.description || `Spacious ${room.name} room.`,
                        isActive: true
                    }))
                }
            }
        });
    }

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
