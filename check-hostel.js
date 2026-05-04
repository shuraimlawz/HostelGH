const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const id = 'cmogn1tan000328b4ed5xa0rr';
  const hostel = await prisma.hostel.findUnique({
    where: { id }
  });
  
  if (hostel) {
    console.log('Hostel found:', {
      id: hostel.id,
      name: hostel.name,
      isPublished: hostel.isPublished,
      ownerId: hostel.ownerId
    });
  } else {
    console.log('Hostel NOT found in DB with ID:', id);
    
    // Try finding by slug (name)
    const byName = await prisma.hostel.findFirst({
      where: { name: { equals: id, mode: 'insensitive' } }
    });
    if (byName) {
      console.log('Hostel found by Name/Slug:', byName.name);
    } else {
      console.log('No hostel found by name either.');
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
