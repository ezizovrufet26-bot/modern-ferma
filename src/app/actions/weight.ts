'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Sessiya yoxdur")
  return session
}

async function getTargetUserId(targetUserId?: string) {
  const session = await getSession()
  if (targetUserId && session.user.role === 'ADMIN') return targetUserId
  return session.user.id
}

export async function addWeightRecord(animalId: string, weight: number, note?: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const record = await prisma.weightRecord.create({
    data: {
      animalId,
      weight,
      note,
      userId: userIdToUse
    }
  })
  revalidatePath('/herd')
  return record
}

export async function updateWeightRecord(id: string, weight: number, note?: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const record = await prisma.weightRecord.update({
    where: { id, userId: userIdToUse },
    data: { weight, note }
  })
  revalidatePath('/herd')
  return record
}

export async function deleteWeightRecord(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  await prisma.weightRecord.delete({ where: { id, userId: userIdToUse } })
  revalidatePath('/herd')
}
