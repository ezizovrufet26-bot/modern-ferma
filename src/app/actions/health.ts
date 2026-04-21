'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addHealthRecord(formData: FormData) {
  const animalId = formData.get('animalId') as string
  const dateStr = formData.get('date') as string
  const disease = formData.get('disease') as string
  const description = formData.get('description') as string
  const treatment = formData.get('treatment') as string
  const medications = formData.get('medications') as string
  const vetName = formData.get('vetName') as string
  const costStr = formData.get('cost') as string

  await prisma.healthRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      type: 'TREATMENT',
      disease: disease || null,
      description,
      treatment: treatment || null,
      medications: medications || null,
      vetName: vetName || null,
      cost: costStr ? parseFloat(costStr) : 0,
    }
  })

  revalidatePath('/herd')
}

export async function addVaccineRecord(formData: FormData) {
  const animalId = formData.get('animalId') as string
  const vaccineName = formData.get('vaccineName') as string
  const dateStr = formData.get('date') as string
  const nextDueDateStr = formData.get('nextDueDate') as string
  const dose = formData.get('dose') as string
  const notes = formData.get('notes') as string

  await prisma.vaccineRecord.create({
    data: {
      animalId,
      vaccineName,
      date: new Date(dateStr),
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr) : null,
      dose: dose || null,
      notes: notes || null,
    }
  })

  revalidatePath('/herd')
}

export async function updateAnimalGroup(animalId: string, groupName: string) {
  await prisma.animal.update({
    where: { id: animalId },
    data: { groupName }
  })
  revalidatePath('/herd')
}

export async function updateHealthRecord(id: string, formData: FormData) {
  const dateStr = formData.get('date') as string
  const disease = formData.get('disease') as string
  const description = formData.get('description') as string
  const treatment = formData.get('treatment') as string
  const medications = formData.get('medications') as string
  const vetName = formData.get('vetName') as string
  const costStr = formData.get('cost') as string

  await prisma.healthRecord.update({
    where: { id },
    data: {
      date: new Date(dateStr),
      disease: disease || null,
      description,
      treatment: treatment || null,
      medications: medications || null,
      vetName: vetName || null,
      cost: costStr ? parseFloat(costStr) : 0,
    }
  })

  revalidatePath('/herd')
}

export async function deleteHealthRecord(id: string) {
  await prisma.healthRecord.delete({ where: { id } })
  revalidatePath('/herd')
}

export async function updateVaccineRecord(id: string, formData: FormData) {
  const vaccineName = formData.get('vaccineName') as string
  const dateStr = formData.get('date') as string
  const nextDueDateStr = formData.get('nextDueDate') as string
  const dose = formData.get('dose') as string
  const notes = formData.get('notes') as string

  await prisma.vaccineRecord.update({
    where: { id },
    data: {
      vaccineName,
      date: new Date(dateStr),
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr) : null,
      dose: dose || null,
      notes: notes || null,
    }
  })

  revalidatePath('/herd')
}

export async function deleteVaccineRecord(id: string) {
  await prisma.vaccineRecord.delete({ where: { id } })
  revalidatePath('/herd')
}

export async function addMassVaccineRecord(formData: FormData) {
  const animalIds = JSON.parse(formData.get('animalIds') as string);
  const vaccineName = formData.get('vaccineName') as string;
  const dateStr = formData.get('date') as string;
  const dose = formData.get('dose') as string;
  const notes = formData.get('notes') as string;

  if (!animalIds.length || !vaccineName) return;

  await prisma.vaccineRecord.createMany({
    data: animalIds.map((id: string) => ({
      animalId: id,
      vaccineName,
      date: new Date(dateStr),
      dose: dose || null,
      notes: notes || null
    }))
  });

  revalidatePath('/herd');
  revalidatePath('/');
}
