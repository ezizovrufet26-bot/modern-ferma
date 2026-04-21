'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getFinanceRecords() {
  return await prisma.financeRecord.findMany({
    orderBy: { date: 'desc' }
  })
}

export async function addFinanceRecord(formData: FormData) {
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  await prisma.financeRecord.create({
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

export async function deleteFinanceRecord(id: string) {
  await prisma.financeRecord.delete({
    where: { id }
  })
  revalidatePath('/finance')
  revalidatePath('/')
}

export async function updateFinanceRecord(id: string, formData: FormData) {
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  await prisma.financeRecord.update({
    where: { id },
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
