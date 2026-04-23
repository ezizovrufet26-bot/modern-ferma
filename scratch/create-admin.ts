import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('adminadmin', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { 
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Test Admin',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('Admin user created/updated:', user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
