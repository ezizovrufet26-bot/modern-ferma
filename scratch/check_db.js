
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.animal.count();
  console.log(`Animal Count: ${count}`);
  const user = await prisma.user.findFirst();
  console.log("Current User:", JSON.stringify(user, null, 2));
  const farms = await prisma.farm.findMany();
  console.log("Farms:", JSON.stringify(farms, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
