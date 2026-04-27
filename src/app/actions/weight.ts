'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

import { getFarmId } from '@/lib/auth-utils'

export async function addWeightRecord(animalId: string, weight: number, note?: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  // Verify ownership
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, farmId: farmIdToUse }
  })
  if (!animal) throw new Error("Heyvan tapılmadı")

  const record = await prisma.weightRecord.create({
    data: {
      animalId,
      weight,
      note
    }
  })
  revalidatePath('/herd')
  return record
}

export async function updateWeightRecord(id: string, weight: number, note?: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  const record = await prisma.weightRecord.update({
    where: { 
      id,
      animal: { farmId: farmIdToUse }
    },
    data: { weight, note }
  })
  revalidatePath('/herd')
  return record
}

export async function deleteWeightRecord(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.weightRecord.delete({ 
    where: { 
      id,
      animal: { farmId: farmIdToUse }
    } 
  })
  revalidatePath('/herd')
}
