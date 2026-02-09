const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImagePaths() {
  try {
    console.log('Starting image path fix...\n');
    
    // Fix place images
    const places = await prisma.place.findMany();
    let placeCount = 0;
    for (const place of places) {
      if (place.image && place.image.includes('\\')) {
        const fixedPath = place.image.replace(/\\/g, '/');
        await prisma.place.update({
          where: { id: place.id },
          data: { image: fixedPath }
        });
        console.log(`✓ Fixed place: ${place.title}`);
        console.log(`  Old: ${place.image}`);
        console.log(`  New: ${fixedPath}\n`);
        placeCount++;
      }
    }

    // Fix user images
    const users = await prisma.user.findMany();
    let userCount = 0;
    for (const user of users) {
      if (user.image && user.image.includes('\\')) {
        const fixedPath = user.image.replace(/\\/g, '/');
        await prisma.user.update({
          where: { id: user.id },
          data: { image: fixedPath }
        });
        console.log(`✓ Fixed user: ${user.name}`);
        console.log(`  Old: ${user.image}`);
        console.log(`  New: ${fixedPath}\n`);
        userCount++;
      }
    }

    console.log('=== Summary ===');
    console.log(`Fixed ${placeCount} place image(s)`);
    console.log(`Fixed ${userCount} user image(s)`);
    console.log('\nAll image paths have been normalized!');

    await prisma.$disconnect();
  } catch (err) {
    console.error('Error fixing image paths:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixImagePaths();
