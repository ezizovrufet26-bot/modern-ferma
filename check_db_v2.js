const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info(FeedingRecord)`);
    console.log("COLUMNS:", columns);
    
    const records = await prisma.$queryRawUnsafe(`SELECT id, frequency, completedMeals FROM FeedingRecord LIMIT 5`);
    console.log("RECORDS:", records);
  } catch (e) {
    console.error(e);
  }
}

check();
