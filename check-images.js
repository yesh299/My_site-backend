const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const places = await prisma.place.findMany({
      select: { id: true, title: true, image: true, location: true }
    });
    console.log('=== PLACES ===');
    places.forEach(p => {
      console.log(`Title: ${p.title}`);
      console.log(`Image: ${p.image}`);
      console.log(`Location:`, p.location);
      console.log('---');
    });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, image: true }
    });
    console.log('\n=== USERS ===');
    users.forEach(u => {
      console.log(`Name: ${u.name}`);
      console.log(`Image: ${u.image}`);
      console.log('---');
    });

    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkImages();
