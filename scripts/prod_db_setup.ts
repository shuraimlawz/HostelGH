import { PrismaClient, UserRole, VerificationStatus, SubscriptionStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

/**
 * PRODUCTION DATABASE SETUP SCRIPT
 * 1. Empties all data
 * 2. Seeds essential system data (Plans)
 * 3. Creates the master admin account
 */

async function main() {
    console.log("🚀 Starting Production Database Setup...");

    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
    if (!connectionString) {
        console.error("❌ DATABASE_URL is missing!");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        // 1. CLEAR ALL DATA (Destructive)
        console.log("🧹 Emptying database...");
        
        const tablenames = await prisma.$queryRaw<
            Array<{ tablename: string }>
        >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

        const tables = tablenames
            .map(({ tablename }) => tablename)
            .filter((name) => name !== "_prisma_migrations")
            .map((name) => `"public"."${name}"`)
            .join(", ");

        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
            console.log("✅ Database emptied successfully.");
        } catch (error) {
            console.log("⚠️ Cascade truncate failed, trying individual deletes...");
            // Fallback for models
            await prisma.payment.deleteMany();
            await prisma.bookingItem.deleteMany();
            await prisma.booking.deleteMany();
            await prisma.room.deleteMany();
            await prisma.hostel.deleteMany();
            await prisma.favorite.deleteMany();
            await prisma.reviewPhoto.deleteMany();
            await prisma.review.deleteMany();
            await prisma.refreshToken.deleteMany();
            await prisma.subscription.deleteMany();
            await prisma.plan.deleteMany();
            await prisma.user.deleteMany();
        }

        // 2. SEED SYSTEM DATA
        console.log("🌱 Seeding essential system data...");
        
        await prisma.plan.createMany({
            data: [
                {
                    code: "FREE",
                    name: "Starter Plan",
                    description: "For small hostel owners. 1 listing limit.",
                    monthlyPrice: 0,
                    yearlyPrice: 0,
                    listingLimit: 1,
                },
                {
                    code: "PRO",
                    name: "Professional Plan",
                    description: "Up to 5 listings with priority support.",
                    monthlyPrice: 5000, // 50 GHS
                    yearlyPrice: 50000, // 500 GHS
                    listingLimit: 5,
                },
                {
                    code: "PREMIUM",
                    name: "Premium Partner",
                    description: "Unlimited listings and featured placements.",
                    monthlyPrice: 15000, // 150 GHS
                    yearlyPrice: 150000, // 1500 GHS
                    listingLimit: null,
                    featuredIncluded: true,
                }
            ]
        });
        console.log("✅ System plans seeded.");

        // 3. CREATE ADMIN ACCOUNT
        console.log("👤 Creating Production Admin...");
        
        const adminEmail = "admin@hostelgh.com";
        const adminPassword = "Allahcom10HostelGH"; // Secure production password
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: UserRole.ADMIN,
                firstName: "HostelGH",
                lastName: "Admin",
                emailVerified: true,
                isActive: true,
                isOnboarded: true,
                isVerified: true,
                verificationStatus: VerificationStatus.VERIFIED,
            }
        });

        console.log("\n" + "=".repeat(40));
        console.log("🎉 PRODUCTION SETUP COMPLETE");
        console.log("=".repeat(40));
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log("=".repeat(40));
        console.log("⚠️ PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN");

    } catch (error: any) {
        console.error("❌ Setup failed:", error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
