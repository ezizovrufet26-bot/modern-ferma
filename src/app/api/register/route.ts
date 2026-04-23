import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email və şifrə mütləqdir.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu email artıq qeydiyyatdan keçib.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: isFirstUser, // İlk istifadəçi aktiv olur, digərləri admin təsdiqi gözləyir
        role: isFirstUser ? 'ADMIN' : 'USER',
      },
    });

    return NextResponse.json({ message: 'Hesab yaradıldı.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server xətası baş verdi.' },
      { status: 500 }
    );
  }
}
