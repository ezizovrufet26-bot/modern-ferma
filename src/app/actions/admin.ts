'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error("İcazəniz yoxdur")
  }
  return session
}

export async function getUsers() {
  await checkAdmin()
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
  await checkAdmin()
  await prisma.user.update({
    where: { id },
    data: { isActive: !currentStatus }
  })
  revalidatePath('/admin/users')
}

export async function deleteUser(id: string) {
  await checkAdmin()
  // Admin özünü silə bilməz
  const session = await auth()
  if (id === session?.user?.id) throw new Error("Özünüzü silə bilməzsiniz")
  
  await prisma.user.delete({
    where: { id }
  })
  revalidatePath('/admin/users')
}
