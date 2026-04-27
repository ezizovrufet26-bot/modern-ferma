import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  const users = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' }
  });

  if (users.length > 0) {
    const admin = users[0];
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    console.log('Admin Email:', admin.email);
    console.log('Admin Password:', '123456');
    console.log('Name:', admin.name);
  } else {
    console.log('No Super Admin found! Creating one...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'rufet@ferma.com',
        password: hashedPassword,
        name: 'Rufet Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
    console.log('Created New Admin Email:', newAdmin.email);
    console.log('Admin Password:', '123456');
  }
}

resetAdmin().catch(console.error).finally(() => prisma.$disconnect());
