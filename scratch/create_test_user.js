const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@modernferma.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if farm exists
  let farm = await prisma.farm.findFirst({ where: { name: 'Test Ferma' } });
  if (!farm) {
    farm = await prisma.farm.create({
      data: {
        name: 'Test Ferma',
        description: 'Sistem testi üçün yaradılmış fərma'
      }
    });
    console.log('Farm created:', farm.id);
  }

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        farmId: farm.id
      }
    });
    console.log('User created:', user.email);
  } else {
    console.log('User already exists:', user.email);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
