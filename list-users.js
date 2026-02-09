const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('count', users.length);
  console.log(JSON.stringify(users, null, 2));
}

main().catch(err => console.error(err)).finally(async () => {
  await prisma.$disconnect();
});
