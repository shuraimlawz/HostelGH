import { PrismaClient, UserRole, RoomGender, HostelBookingStatus, RoomStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HOSTEL_NAMES_PREFIX = ["Elite", "Royal", "University", "Premium", "Student", "Haven", "Skyline", "Apex", "Unity", "Golden", "Blue", "Emerald", "Diamond", "Central", "City"];
const HOSTEL_NAMES_SUFFIX = ["Residence", "Hall", "Plaza", "Lodge", "Suites", "Gardens", "View", "Heights", "Apartments", "Home"];

const CITIES = [
    { city: "Accra", university: "University of Ghana (UG)", region: "Greater Accra" },
    { city: "Accra", university: "UPSA", region: "Greater Accra" },
    { city: "Accra", university: "GCTU", region: "Greater Accra" },
    { city: "Kumasi", university: "KNUST", region: "Ashanti" },
    { city: "Cape Coast", university: "UCC", region: "Central" },
];

const IMAGES = [
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/FuubNuyWIAAzS0c.jpg",
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/SRC_hostel_KNUST-Kumasi.jpg",
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/evandy-scaled-1.jpg",
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/upsahostel.jpg",
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/Hostel_Block_B_GCTU.jpg",
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/hall-seven.jpg",
    "https://res.cloudinary.com/dlrigl6rq/image/upload/v1713432000/BfTDaFFIUAAYpK9.jpg",
];

const AMENITIES = ["WiFi", "Water 24/7", "CCTV", "Security Post", "Study Room", "Standby Generator", "Laundry", "Kitchenette", "Gym", "Balcony"];

async function main() {
    console.log("🚀 Starting Massive Seeding (50+ Hostels)...");

    const passwordHash = await bcrypt.hash("Password123!", 12);

    // 1. Create a dedicated Demo Owner
    const owner = await prisma.user.upsert({
        where: { email: "demo-owner@hostelgh.com" },
        update: {},
        create: {
            email: "demo-owner@hostelgh.com",
            passwordHash,
            role: UserRole.OWNER,
            firstName: "Elite",
            lastName: "Developer",
            isVerified: true,
            emailVerified: true,
            isOnboarded: true,
        },
    });

    console.log(`👤 Demo Owner created: ${owner.email}`);

    // 2. Generate 50 Hostels
    for (let i = 1; i <= 55; i++) {
        const prefix = HOSTEL_NAMES_PREFIX[Math.floor(Math.random() * HOSTEL_NAMES_PREFIX.length)];
        const suffix = HOSTEL_NAMES_SUFFIX[Math.floor(Math.random() * HOSTEL_NAMES_SUFFIX.length)];
        const location = CITIES[Math.floor(Math.random() * CITIES.length)];
        
        const hostelName = `${prefix} ${suffix} ${i > 25 ? "Phase II" : ""}`;
        const hostelImages = [...IMAGES].sort(() => 0.5 - Math.random()).slice(0, 3);
        const hostelAmenities = [...AMENITIES].sort(() => 0.5 - Math.random()).slice(0, 6);

        const hostel = await prisma.hostel.create({
            data: {
                ownerId: owner.id,
                name: hostelName,
                description: `A premium ${hostelName} located near ${location.university}. Offering state-of-the-art facilities and a secure environment for students.`,
                addressLine: `${Math.floor(Math.random() * 100) + 1} ${prefix} Street, ${location.city}`,
                city: location.city,
                region: location.region,
                university: location.university,
                images: hostelImages,
                amenities: hostelAmenities,
                isPublished: true,
                isVerifiedHostel: Math.random() > 0.3,
                isFeatured: Math.random() > 0.8,
                minPrice: (1500 + Math.floor(Math.random() * 4500)) * 100, // in pesewas
                whatsappNumber: "0240000000",
                distanceToCampus: `${Math.floor(Math.random() * 15) + 2} mins walk`,
                bookingStatus: HostelBookingStatus.OPEN,
                genderCategory: Math.random() > 0.5 ? RoomGender.MIXED : (Math.random() > 0.5 ? RoomGender.MALE : RoomGender.FEMALE),
                utilitiesIncluded: ["Water", "Trash", "Electricity"],
            },
        });

        // 3. Create Rooms for each Hostel
        const roomConfigs = ["1 in a room", "2 in a room", "3 in a room", "4 in a room"];
        for (const config of roomConfigs) {
            const basePrice = (1200 + Math.floor(Math.random() * 3000)) * 100;
            const price = config === "1 in a room" ? basePrice * 2 : (config === "2 in a room" ? basePrice * 1.5 : basePrice);

            await prisma.room.create({
                data: {
                    hostelId: hostel.id,
                    name: config,
                    roomConfiguration: config,
                    capacity: parseInt(config[0]),
                    totalUnits: 10,
                    totalSlots: 10 * parseInt(config[0]),
                    availableSlots: 10 * parseInt(config[0]),
                    pricePerTerm: Math.floor(price),
                    gender: hostel.genderCategory || RoomGender.MIXED,
                    hasAC: Math.random() > 0.5,
                    status: RoomStatus.AVAILABLE,
                    isActive: true,
                },
            });
        }

        if (i % 10 === 0) console.log(`✅ Seeded ${i} hostels...`);
    }

    console.log("\n✨ Seeding Complete! 55 Hostels added with realistic details.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
