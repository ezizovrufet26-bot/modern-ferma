const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up...');
  // Force reset already did this but let's be sure
  
  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('Creating Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'rufet@ferma.com',
      password: hashedPassword,
      name: 'Rufet Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('Creating Test Farm...');
  const farm = await prisma.farm.create({
    data: {
      name: 'Xəzər Ferması',
      description: 'Müasir südlük fərma kompleksi'
    }
  });

  console.log('Creating Farm Admin...');
  const farmAdmin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Əhməd Admin',
      role: 'FARM_ADMIN',
      isActive: true,
      farmId: farm.id
    }
  });

  console.log('Creating Farm Staff...');
  await prisma.user.create({
    data: {
      email: 'vet@admin.com',
      password: hashedPassword,
      name: 'Dr. Murad',
      role: 'FARM_USER',
      isActive: true,
      farmId: farm.id
    }
  });

  console.log('SaaS Seed completed!');
  console.log('Farm ID:', farm.id);
  console.log('Farm Admin:', farmAdmin.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
