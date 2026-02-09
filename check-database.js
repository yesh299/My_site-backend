const { prisma } = require('./util/db-prisma');

async function checkDatabase() {
  console.log('\n🔍 Checking Neon Database...\n');

  try {
    // Check users table
    const usersCount = await prisma.user.count();
    console.log(`✅ Users table exists - ${usersCount} users found`);

    // Check places table
    const placesCount = await prisma.place.count();
    console.log(`✅ Places table exists - ${placesCount} places found`);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { places: true }
        }
      }
    });

    if (users.length > 0) {
      console.log('\n📋 Users in database:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user._count.places} places`);
      });
    } else {
      console.log('\n📋 No users yet. Sign up to create your first user!');
    }

    // Get all places
    const places = await prisma.place.findMany({
      select: {
        id: true,
        title: true,
        address: true,
        creator: {
          select: {
            name: true
          }
        }
      }
    });

    if (places.length > 0) {
      console.log('\n📍 Places in database:');
      places.forEach(place => {
        console.log(`  - ${place.title} at ${place.address} (by ${place.creator.name})`);
      });
    } else {
      console.log('\n📍 No places yet. Create your first place!');
    }

    console.log('\n✅ Database is working correctly!\n');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
