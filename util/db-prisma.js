const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to Prisma database');
  })
  .catch((err) => {
    console.error('❌ Prisma connection failed:', err.message);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { prisma };
