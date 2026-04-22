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

async function getTargetUserId(targetUserId?: string) {
  const session = await getSession()
  if (targetUserId && session.user.role === 'ADMIN') {
    return targetUserId
  }
  return session.user.id
}

export async function getMilkRecords(targetUserId?: string) {
  try {
    const userIdToUse = await getTargetUserId(targetUserId)
    return await prisma.milkRecord.findMany({
      where: { 
        animal: { userId: userIdToUse } 
      },
      orderBy: { date: 'desc' },
      include: {
        animal: true
      }
    })
  } catch (error) {
    console.error("Failed to fetch milk records:", error)
    return []
  }
}

export async function addMilkRecord(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  const animalId = formData.get('animalId') as string
  const dateStr = formData.get('date') as string
  const yieldMorning = parseFloat(formData.get('yieldMorning') as string || '0')
  const yieldEvening = parseFloat(formData.get('yieldEvening') as string || '0')
  const totalYield = yieldMorning + yieldEvening

  await prisma.milkRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      yieldMorning,
      yieldEvening,
      totalYield
    }
  })

  revalidatePath('/milk')
  revalidatePath('/herd')
}

export async function updateMilkRecord(id: string, formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  const dateStr = formData.get('date') as string
  const yieldMorning = parseFloat(formData.get('yieldMorning') as string || '0')
  const yieldEvening = parseFloat(formData.get('yieldEvening') as string || '0')
  const totalYield = yieldMorning + yieldEvening

  await prisma.milkRecord.update({
    where: { 
      id,
      animal: { userId: userIdToUse }
    },
    data: {
      date: new Date(dateStr),
      yieldMorning,
      yieldEvening,
      totalYield
    }
  })

  revalidatePath('/milk')
  revalidatePath('/herd')
}

export async function deleteMilkRecord(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  await prisma.milkRecord.delete({
    where: { 
      id,
      animal: { userId: userIdToUse }
    }
  })

  revalidatePath('/milk')
  revalidatePath('/herd')
}
