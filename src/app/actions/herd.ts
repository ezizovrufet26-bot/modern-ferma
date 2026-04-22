'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Daxil olmayıbsınız")
  }
  return session
}

// Universal User ID Resolver for Super Admin
async function getTargetUserId(targetUserId?: string) {
  const session = await getSession()
  if (targetUserId && session.user.role === 'ADMIN') {
    return targetUserId
  }
  return session.user.id
}

export async function getAnimal(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  return await prisma.animal.findFirst({
    where: { id, userId: userIdToUse },
    include: {
      calvingRecords: { orderBy: { date: 'desc' } }
    }
  })
}

export async function getAnimals(targetUserId?: string) {
  try {
    const userIdToUse = await getTargetUserId(targetUserId)

    const animals = await prisma.animal.findMany({
      where: { userId: userIdToUse },
      orderBy: { createdAt: 'desc' },
      include: {
        reproRecords: {
          orderBy: { date: 'desc' },
          include: { vet: true }
        },
        mother: true,
        children: true,
        calvingRecords: {
          orderBy: { date: 'desc' }
        },
        healthRecords: {
          orderBy: { date: 'desc' }
        },
        vaccineRecords: {
          orderBy: { date: 'desc' }
        },
        weightRecords: {
          orderBy: { date: 'desc' }
        }
      }
    })
    return animals
  } catch (error) {
    console.error("Failed to fetch animals:", error)
    return []
  }
}

export async function addAnimal(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  const tagNumber = formData.get('tagNumber') as string
  const name = formData.get('name') as string
  const breed = formData.get('breed') as string
  const gender = formData.get('gender') as string || 'FEMALE'
  const birthDateStr = formData.get('birthDate') as string
  const stage = formData.get('stage') as string || 'ACTIVE'
  const groupName = formData.get('groupName') as string
  const motherInput = formData.get('motherId') as string
  const sireCode = formData.get('sireCode') as string

  let birthDate = birthDateStr ? new Date(birthDateStr) : null
  let motherId = null

  if (motherInput) {
    const mother = await prisma.animal.findFirst({
      where: { tagNumber: motherInput, userId: userIdToUse }
    })
    if (mother) motherId = mother.id
  }

  await prisma.animal.create({
    data: {
      tagNumber,
      name: name || null,
      breed: breed || null,
      gender,
      stage,
      groupName,
      birthDate,
      motherId,
      sireCode: sireCode || null,
      userId: userIdToUse
    }
  })

  revalidatePath('/herd')
}

export async function deleteAnimal(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  await prisma.animal.delete({
    where: { id, userId: userIdToUse }
  })
  revalidatePath('/herd')
}

export async function updateAnimal(id: string, formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  const data: any = {}
  formData.forEach((value, key) => {
    if (key === 'birthDate') data[key] = value ? new Date(value as string) : null
    else if (key !== 'id' && key !== 'animalId' && key !== 'targetUserId') {
       data[key] = value
    }
  })

  await prisma.animal.update({
    where: { id, userId: userIdToUse },
    data
  })
  revalidatePath('/herd')
}

export async function saveArtificialInsemination(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const animalId = formData.get('animalId') as string;
  const dateStr = formData.get('inseminationDate') as string;
  const sireCode = formData.get('sireCode') as string;
  const vetId = formData.get('vetId') as string;

  const calvingEstimate = new Date(dateStr);
  calvingEstimate.setDate(calvingEstimate.getDate() + 283);

  await prisma.reproductionRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      eventType: 'INSEMINATION',
      expectedCalvingDate: calvingEstimate,
      vetId: vetId || null,
      notes: JSON.stringify({ sireCode })
    }
  });

  await prisma.animal.update({
    where: { id: animalId },
    data: {
      lastBreedingDate: new Date(dateStr),
      expectedCalvingDate: calvingEstimate,
      isPregnant: false // Hələ təsdiqlənməyib
    }
  });

  revalidatePath('/herd');
}

export async function updateArtificialInsemination(id: string, formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const dateStr = formData.get('inseminationDate') as string;
  const sireCode = formData.get('sireCode') as string;
  const vetId = formData.get('vetId') as string;

  await prisma.reproductionRecord.update({
    where: { id, animal: { userId: userIdToUse } },
    data: {
      date: new Date(dateStr),
      vetId: vetId || null,
      notes: JSON.stringify({ sireCode })
    }
  });

  revalidatePath('/herd');
}

export async function deleteArtificialInsemination(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  // Admin yoxlaması targetUserId vasitəsilə keçir
  await prisma.reproductionRecord.delete({ 
    where: { id, animal: { userId: userIdToUse } } 
  });
  revalidatePath('/herd');
}

export async function saveCalving(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const motherId = formData.get('motherId') as string;
  const dateStr = formData.get('calvingDate') as string;
  const calfTag = formData.get('calfTag') as string;
  const calfGender = formData.get('calfGender') as string;
  const calfBreed = formData.get('calfBreed') as string;

  const calvingDate = new Date(dateStr);

  let calfId = null;
  if (calfTag) {
    const calf = await prisma.animal.create({
      data: {
        tagNumber: calfTag,
        gender: calfGender,
        birthDate: calvingDate,
        motherId: motherId,
        breed: calfBreed || null,
        stage: 'CALF',
        groupName: 'BUZOVLAR',
        userId: userIdToUse
      }
    });
    calfId = calf.id;
  }

  await prisma.calvingRecord.create({
    data: {
      animalId: motherId,
      date: calvingDate,
      calfGender: calfGender,
      calfId: calfId
    }
  });

  // Hamiləlik statusunu sıfırla və mərhələni yenilə
  await prisma.animal.update({
    where: { id: motherId },
    data: { 
      isPregnant: false, 
      expectedCalvingDate: null, 
      isDry: false,
      stage: 'ACTIVE' 
    }
  });

  revalidatePath('/herd');
}

export async function savePregnancyCheck(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const animalId = formData.get('animalId') as string;
  const dateStr = formData.get('checkDate') as string;
  const result = formData.get('result') as string; // PREGNANT, NEGATIVE
  const notes = formData.get('notes') as string;

  const isPregnant = result === 'PREGNANT';
  
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  let expectedCalvingDate = animal?.expectedCalvingDate;

  if (isPregnant && animal?.lastBreedingDate) {
    // Təxmini 283 gün
    expectedCalvingDate = new Date(animal.lastBreedingDate);
    expectedCalvingDate.setDate(expectedCalvingDate.getDate() + 283);
  }

  await prisma.reproductionRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      eventType: isPregnant ? 'PREGNANCY_CONFIRMED' : 'PREGNANCY_NEGATIVE',
      expectedCalvingDate: isPregnant ? expectedCalvingDate : null,
      notes
    }
  });

  await prisma.animal.update({
    where: { id: animalId },
    data: { 
      isPregnant,
      expectedCalvingDate: isPregnant ? expectedCalvingDate : null
    }
  });

  revalidatePath('/herd');
}

export async function saveDryPeriod(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const animalId = formData.get('animalId') as string;
  const dateStr = formData.get('dryDate') as string;
  const notes = formData.get('notes') as string;

  await prisma.reproductionRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      eventType: 'DRY_OFF',
      notes
    }
  });

  await prisma.animal.update({
    where: { id: animalId },
    data: { 
      isDry: true,
      dryDate: new Date(dateStr)
    }
  });

  revalidatePath('/herd');
}

export async function importAnimalsFromData(data: any[], targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  let count = 0

  for (const item of data) {
    const tagNumber = String(item['Bırka'] || item['Tag'] || item['Tag Number'] || item['tagNumber'] || '').trim()
    if (!tagNumber) continue

    const name = item['Ad'] || item['Name'] || item['name']
    const breed = item['Cins'] || item['Breed'] || item['breed']
    const genderRaw = String(item['Cinsiyyət'] || item['Gender'] || item['gender'] || 'FEMALE').toUpperCase()
    const gender = (genderRaw === 'ERKƏK' || genderRaw === 'MALE') ? 'MALE' : 'FEMALE'
    const birthDateValue = item['Doğum Tarixi'] || item['Doğum'] || item['Birth Date'] || item['birthDate']
    const groupName = item['Qrup'] || item['Group'] || item['groupName'] || 'SAĞMAL 1'

    let birthDate = null
    if (birthDateValue) {
      const d = new Date(birthDateValue)
      if (!isNaN(d.getTime())) birthDate = d
    }

    await prisma.animal.upsert({
      where: { 
        tagNumber_userId: {
          tagNumber,
          userId: userIdToUse
        }
      },
      update: {
        name: name ? String(name) : undefined,
        breed: breed ? String(breed) : undefined,
        gender,
        birthDate,
        groupName: String(groupName)
      },
      create: {
        tagNumber,
        name: name ? String(name) : null,
        breed: breed ? String(breed) : null,
        gender,
        birthDate,
        groupName: String(groupName),
        userId: userIdToUse
      }
    })
    count++
  }

  revalidatePath('/herd')
  return { success: true, importedCount: count }
}


export async function addHealthAction(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const animalId = formData.get('animalId') as string;
  const dateStr = formData.get('date') as string;
  const type = formData.get('type') as string;
  const disease = formData.get('disease') as string;
  const description = formData.get('description') as string;
  const treatment = formData.get('treatment') as string;
  const medications = formData.get('medications') as string;
  const vetName = formData.get('vetName') as string;
  const cost = parseFloat(formData.get('cost') as string || '0');

  await prisma.healthRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      type,
      disease,
      description,
      treatment,
      medications,
      vetName,
      cost
    }
  });

  if (cost > 0) {
    const animal = await prisma.animal.findUnique({ where: { id: animalId } });
    await prisma.financeRecord.create({
      data: {
        userId: userIdToUse,
        date: new Date(dateStr),
        type: 'EXPENSE',
        category: 'VET',
        amount: cost,
        description: `${disease || type} müalicəsi - Heyvan: ${animal?.tagNumber || animalId}`
      }
    });
  }

  revalidatePath('/', 'layout');
}

export async function updateHealthAction(id: string, formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const dateStr = formData.get('date') as string;
  const type = formData.get('type') as string;
  const disease = formData.get('disease') as string;
  const description = formData.get('description') as string;
  const treatment = formData.get('treatment') as string;
  const medications = formData.get('medications') as string;
  const vetName = formData.get('vetName') as string;
  const cost = parseFloat(formData.get('cost') as string || '0');

  await prisma.healthRecord.update({
    where: { id, animal: { userId: userIdToUse } },
    data: {
      date: new Date(dateStr),
      type,
      disease,
      description,
      treatment,
      medications,
      vetName,
      cost
    }
  });

  revalidatePath('/', 'layout');
}

export async function deleteHealthAction(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  await prisma.healthRecord.delete({
    where: { id, animal: { userId: userIdToUse } }
  });
  revalidatePath('/', 'layout');
}

export async function addVaccineAction(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const animalId = formData.get('animalId') as string;
  const vaccineName = formData.get('vaccineName') as string;
  const dateStr = formData.get('date') as string;
  const dose = formData.get('dose') as string;
  const notes = formData.get('notes') as string;

  await prisma.vaccineRecord.create({
    data: {
      animalId,
      vaccineName,
      date: new Date(dateStr),
      dose,
      notes
    }
  });
  revalidatePath('/', 'layout');
}

export async function deleteVaccineAction(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  await prisma.vaccineRecord.delete({
    where: { id, animal: { userId: userIdToUse } }
  });
  revalidatePath('/', 'layout');
}

export async function addMassVaccineAction(formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const animalIdsStr = formData.get('animalIds') as string;
  const vaccineName = formData.get('vaccineName') as string;
  const dateStr = formData.get('date') as string;
  const dose = formData.get('dose') as string;
  
  const animalIds = JSON.parse(animalIdsStr);

  if (animalIds && animalIds.length > 0) {
    await prisma.vaccineRecord.createMany({
      data: animalIds.map((aid: string) => ({
        animalId: aid,
        vaccineName,
        date: new Date(dateStr),
        dose
      }))
    });
  }
  revalidatePath('/', 'layout');
}

export async function updateVaccineAction(id: string, formData: FormData, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const vaccineName = formData.get('vaccineName') as string;
  const dateStr = formData.get('date') as string;
  const dose = formData.get('dose') as string;
  const notes = formData.get('notes') as string;

  await prisma.vaccineRecord.update({
    where: { id, animal: { userId: userIdToUse } },
    data: {
      vaccineName,
      date: new Date(dateStr),
      dose,
      notes
    }
  });
  revalidatePath('/', 'layout');
}
