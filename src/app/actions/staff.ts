'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Daxil olmayıbsınız")
  }
  return session
}

// Universal User ID Resolver for Super Admin
async function getTargetUserId(targetUserId?: string) {
  const session = await getSession()
  if (targetUserId && session.user.role === 'ADMIN') {
    return targetUserId
  }
  return session.user.id
}

export async function getStaff(targetUserId?: string) {
  try {
    const userIdToUse = await getTargetUserId(targetUserId)
    return await prisma.staff.findMany({
      where: { userId: userIdToUse },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Failed to fetch staff:", error)
    return []
  }
}

export async function createStaff(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const phone = formData.get('phone') as string
  const salary = parseFloat(formData.get('salary') as string || '0')

  await prisma.staff.create({
    data: {
      name,
      role,
      phone: phone || null,
      salary,
      userId: userIdToUse
    }
  })

  revalidatePath('/staff')
  revalidatePath('/herd')
}

export async function deleteStaff(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  await prisma.staff.delete({
    where: { 
      id,
      userId: userIdToUse
    }
  })
  revalidatePath('/staff')
  revalidatePath('/herd')
}

