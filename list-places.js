require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany();
  console.log('count', places.length);
  console.log(JSON.stringify(places, null, 2));
}

main().catch(err => console.error(err)).finally(async () => {
  await prisma.$disconnect();
});
