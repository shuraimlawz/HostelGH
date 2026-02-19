import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting cleanup...');

    // Delete dependent records first to avoid foreign key constraints
    console.log('Deleting Payments...');
    await prisma.payment.deleteMany({});

    console.log('Deleting Booking Items...');
    await prisma.bookingItem.deleteMany({});

    console.log('Deleting Bookings...');
    await prisma.booking.deleteMany({});

    console.log('Deleting Rooms...');
    await prisma.room.deleteMany({});

    // Finally delete hostels
    console.log('Deleting Hostels...');
    const { count } = await prisma.hostel.deleteMany({});

    console.log(`Cleanup complete. Removed ${count} hostels.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
