'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

import { getFarmId } from '@/lib/auth-utils'

export async function getMilkRecords(targetFarmId?: string) {
  try {
    const farmIdToUse = await getFarmId(targetFarmId)
    return await prisma.milkRecord.findMany({
      where: { 
        animal: { farmId: farmIdToUse } 
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

export async function addMilkRecord(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
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

export async function updateMilkRecord(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  const dateStr = formData.get('date') as string
  const yieldMorning = parseFloat(formData.get('yieldMorning') as string || '0')
  const yieldEvening = parseFloat(formData.get('yieldEvening') as string || '0')
  const totalYield = yieldMorning + yieldEvening

  await prisma.milkRecord.update({
    where: { 
      id,
      animal: { farmId: farmIdToUse }
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

export async function deleteMilkRecord(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  await prisma.milkRecord.delete({
    where: { 
      id,
      animal: { farmId: farmIdToUse }
    }
  })

  revalidatePath('/milk')
  revalidatePath('/herd')
}
