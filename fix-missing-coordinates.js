const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getCoordinatesForAddress = require('./util/location');

async function fixMissingCoordinates() {
  try {
    console.log('Fixing places with missing coordinates...\n');
    
    // Get all places and filter for null location
    const allPlaces = await prisma.place.findMany();
    const placesWithoutLocation = allPlaces.filter(place => !place.location);

    if (placesWithoutLocation.length === 0) {
      console.log('No places found without coordinates.');
      await prisma.$disconnect();
      return;
    }

    for (const place of placesWithoutLocation) {
      console.log(`Processing: ${place.title}`);
      console.log(`Address: ${place.address}`);
      
      try {
        const coordinates = await getCoordinatesForAddress(place.address);
        
        await prisma.place.update({
          where: { id: place.id },
          data: { location: coordinates }
        });
        
        console.log(`✓ Added coordinates: lat=${coordinates.lat}, lng=${coordinates.lng}\n`);
      } catch (err) {
        console.log(`✗ Failed to get coordinates: ${err.message}\n`);
      }
    }

    console.log('Done!');
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixMissingCoordinates();
