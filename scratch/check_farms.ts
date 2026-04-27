import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const farms = await prisma.farm.findMany();
  console.log(JSON.stringify(farms, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
