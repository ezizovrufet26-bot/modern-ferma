const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const records = await prisma.feedingRecord.findMany({
    take: 5,
    orderBy: { date: 'desc' }
  });
  console.log(JSON.stringify(records, null, 2));
}

check();
