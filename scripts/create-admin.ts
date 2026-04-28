import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { URL } from "url";
import "dotenv/config";

let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
try {
    if (connectionString) {
        const url = new URL(connectionString);
        if (url.searchParams.has("sslmode")) {
            url.searchParams.delete("sslmode");
        }
        connectionString = url.toString();
    }
} catch (e) {}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Creating admin user...");

    const passwordHash = await bcrypt.hash("Password123!", 12);

    const admin = await prisma.user.upsert({
        where: { email: "ramosnewz@gmail.com" },
        update: {},
        create: {
            email: "ramosnewz@gmail.com",
            passwordHash,
            role: UserRole.ADMIN,
            firstName: "Shuraim",
            lastName: "Administrator",
            emailVerified: true,
            isActive: true,
        },
    });

    console.log("Admin user created successfully:", admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
