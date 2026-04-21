'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getStaff() {
  try {
    return await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Failed to fetch staff:", error)
    return []
  }
}

export async function createStaff(formData: FormData) {
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const phone = formData.get('phone') as string

  await prisma.staff.create({
    data: {
      name,
      role,
      phone: phone || null
    }
  })

  revalidatePath('/staff')
  revalidatePath('/herd')
}

export async function deleteStaff(id: string) {
  await prisma.staff.delete({
    where: { id }
  })
  revalidatePath('/staff')
  revalidatePath('/herd')
}
