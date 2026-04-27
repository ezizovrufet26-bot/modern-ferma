'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

import { getFarmId } from '@/lib/auth-utils'

export async function getStaff(targetFarmId?: string) {
  try {
    const farmIdToUse = await getFarmId(targetFarmId)
    return await prisma.staff.findMany({
      where: { farmId: farmIdToUse },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Failed to fetch staff:", error)
    return []
  }
}

export async function createStaff(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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
      farmId: farmIdToUse
    }
  })

  revalidatePath('/staff')
  revalidatePath('/herd')
}

export async function deleteStaff(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.staff.delete({
    where: { 
      id,
      farmId: farmIdToUse
    }
  })
  revalidatePath('/staff')
  revalidatePath('/herd')
}

