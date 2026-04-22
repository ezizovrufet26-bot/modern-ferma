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

// UNIVERSAL USER ID RESOLVER
async function getTargetUserId(targetUserId?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Daxil olmayıbsınız")
  }
  if (targetUserId && session.user.role === 'ADMIN') return targetUserId
  return session.user.id
}

export async function getFinanceRecords(targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  return await prisma.financeRecord.findMany({
    where: { userId: userIdToUse },
    orderBy: { date: 'desc' }
  })
}

export async function addFinanceRecord(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const amount = parseFloat(formData.get('amount') as string)
  const date = new Date(formData.get('date') as string)
  const description = formData.get('description') as string

  await prisma.financeRecord.create({
    data: {
      type,
      category,
      amount,
      date,
      description: description || null,
      userId: userIdToUse
    }
  })

  revalidatePath('/finance')
}

export async function deleteFinanceRecord(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  await prisma.financeRecord.delete({
    where: { 
      id,
      userId: userIdToUse 
    }
  })
  revalidatePath('/finance')
}

export async function updateFinanceRecord(id: string, formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  await prisma.financeRecord.update({
    where: { 
      id,
      userId: userIdToUse 
    },
    data: {
      type,
      category,
      amount,
      date: new Date(date),
      description: description || null
    }
  })

  revalidatePath('/finance')
  revalidatePath('/')
}
