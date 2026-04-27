'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

import { getFarmId } from '@/lib/auth-utils'

export async function getFinanceRecords(targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  return await prisma.financeRecord.findMany({
    where: { farmId: farmIdToUse },
    orderBy: { date: 'desc' }
  })
}

export async function addFinanceRecord(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
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
      farmId: farmIdToUse
    }
  })

  revalidatePath('/finance')
}

export async function deleteFinanceRecord(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  await prisma.financeRecord.delete({
    where: { 
      id,
      farmId: farmIdToUse 
    }
  })
  revalidatePath('/finance')
}

export async function updateFinanceRecord(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  await prisma.financeRecord.update({
    where: { 
      id,
      farmId: farmIdToUse 
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
