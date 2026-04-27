'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

import { getFarmId } from '@/lib/auth-utils'

export async function addHealthRecord(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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

export async function updateHealthRecord(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  const dateStr = formData.get('date') as string
  const disease = formData.get('disease') as string
  const description = formData.get('description') as string
  const treatment = formData.get('treatment') as string
  const medications = formData.get('medications') as string
  const vetName = formData.get('vetName') as string
  const costStr = formData.get('cost') as string

  await prisma.healthRecord.update({
    where: { id, animal: { farmId: farmIdToUse } },
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

export async function deleteHealthRecord(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.healthRecord.delete({ 
    where: { id, animal: { farmId: farmIdToUse } } 
  })
  revalidatePath('/herd')
}

export async function addVaccineRecord(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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

export async function updateVaccineRecord(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  const vaccineName = formData.get('vaccineName') as string
  const dateStr = formData.get('date') as string
  const nextDueDateStr = formData.get('nextDueDate') as string
  const dose = formData.get('dose') as string
  const notes = formData.get('notes') as string

  await prisma.vaccineRecord.update({
    where: { id, animal: { farmId: farmIdToUse } },
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

export async function deleteVaccineRecord(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.vaccineRecord.delete({ 
    where: { id, animal: { farmId: farmIdToUse } } 
  })
  revalidatePath('/herd')
}

export async function addMassVaccineRecord(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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
}

export async function updateAnimalGroup(animalId: string, groupName: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.animal.update({
    where: { id: animalId, farmId: farmIdToUse },
    data: { groupName }
  })
  revalidatePath('/herd')
}
