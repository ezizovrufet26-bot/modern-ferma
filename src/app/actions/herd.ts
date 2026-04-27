'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getFarmId } from '@/lib/auth-utils'

export async function getAnimal(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  return await prisma.animal.findFirst({
    where: { id, farmId: farmIdToUse },
    include: {
      calvingRecords: { orderBy: { date: 'desc' } }
    }
  })
}

export async function getAnimals(targetFarmId?: string) {
  try {
    const farmIdToUse = await getFarmId(targetFarmId)

    const animals = await prisma.animal.findMany({
      where: { farmId: farmIdToUse },
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

export async function addAnimal(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  const tagNumber = formData.get('tagNumber') as string
  const name = formData.get('name') as string
  const breed = formData.get('breed') as string
  const gender = formData.get('gender') as string || 'FEMALE'
  const birthDateStr = formData.get('birthDate') as string
  const stage = formData.get('stage') as string || 'ACTIVE'
  const groupName = formData.get('groupName') as string
  const motherInput = formData.get('motherId') as string
  const sireCode = formData.get('sireCode') as string

  // New fields
  const lastCalvingDateStr = formData.get('lastCalvingDate') as string
  const calfTag = formData.get('calfTag') as string

  const birthDate = birthDateStr ? new Date(birthDateStr) : null
  let motherId = null

  if (motherInput) {
    const mother = await prisma.animal.findFirst({
      where: { tagNumber: motherInput, farmId: farmIdToUse }
    })
    if (mother) motherId = mother.id
  }

  const newAnimal = await prisma.animal.create({
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
      farmId: farmIdToUse
    }
  })

  // Handle Last Calving Date and Calf
  if (lastCalvingDateStr) {
    const calvingDate = new Date(lastCalvingDateStr)
    
    let calfId = null
    if (calfTag) {
      const calf = await prisma.animal.create({
        data: {
          tagNumber: calfTag,
          gender: 'FEMALE', // Default to female or we could add a gender field for calf
          birthDate: calvingDate,
          motherId: newAnimal.id,
          breed: breed || null,
          stage: 'CALF',
          groupName: 'BUZOVLAR',
          farmId: farmIdToUse
        }
      })
      calfId = calf.id
    }

    await prisma.calvingRecord.create({
      data: {
        animalId: newAnimal.id,
        date: calvingDate,
        calfGender: 'FEMALE',
        calfId: calfId
      }
    })
  }

  revalidatePath('/herd')
}

export async function deleteAnimal(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  await prisma.animal.delete({
    where: { id, farmId: farmIdToUse }
  })
  revalidatePath('/herd')
}

export async function updateAnimal(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  
  const data: any = {}
  const lastCalvingDateStr = formData.get('lastCalvingDate') as string
  const calfTag = formData.get('calfTag') as string

  formData.forEach((value, key) => {
    if (key === 'birthDate') data[key] = value ? new Date(value as string) : null
    else if (key !== 'id' && key !== 'animalId' && key !== 'targetFarmId' && key !== 'lastCalvingDate' && key !== 'calfTag') {
       data[key] = value
    }
  })

  const updatedAnimal = await prisma.animal.update({
    where: { id, farmId: farmIdToUse },
    data,
    include: { calvingRecords: true }
  })

  // Handle calving record update
  if (lastCalvingDateStr) {
    const calvingDate = new Date(lastCalvingDateStr)
    const existingCalving = updatedAnimal.calvingRecords[0]

    if (!existingCalving || new Date(existingCalving.date).getTime() !== calvingDate.getTime()) {
      let calfId = null
      if (calfTag) {
        const calf = await prisma.animal.upsert({
          where: { tagNumber_farmId: { tagNumber: calfTag, farmId: farmIdToUse } },
          update: { birthDate: calvingDate, motherId: id },
          create: {
            tagNumber: calfTag,
            gender: 'FEMALE',
            birthDate: calvingDate,
            motherId: id,
            stage: 'CALF',
            groupName: 'BUZOVLAR',
            farmId: farmIdToUse
          }
        })
        calfId = calf.id
      }

      if (existingCalving) {
        await prisma.calvingRecord.update({
          where: { id: existingCalving.id },
          data: { date: calvingDate, calfId }
        })
      } else {
        await prisma.calvingRecord.create({
          data: { animalId: id, date: calvingDate, calfGender: 'FEMALE', calfId }
        })
      }
    }
  }

  revalidatePath('/herd')
}

export async function saveArtificialInsemination(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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

export async function updateArtificialInsemination(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  const dateStr = formData.get('inseminationDate') as string;
  const sireCode = formData.get('sireCode') as string;
  const vetId = formData.get('vetId') as string;

  await prisma.reproductionRecord.update({
    where: { id, animal: { farmId: farmIdToUse } },
    data: {
      date: new Date(dateStr),
      vetId: vetId || null,
      notes: JSON.stringify({ sireCode })
    }
  });

  revalidatePath('/herd');
}

export async function deleteArtificialInsemination(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  // Admin yoxlaması targetFarmId vasitəsilə keçir
  await prisma.reproductionRecord.delete({ 
    where: { id, animal: { farmId: farmIdToUse } } 
  });
  revalidatePath('/herd');
}

export async function saveCalving(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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
        farmId: farmIdToUse
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

export async function savePregnancyCheck(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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

export async function saveDryPeriod(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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

export async function importAnimalsFromData(data: any[], targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  let count = 0

  for (const item of data) {
    const tagNumber = String(item['Bırka'] || item['Tag'] || item['Tag Number'] || item['tagNumber'] || item['ID'] || item['No'] || '').trim()
    if (!tagNumber) continue

    const name = item['Ad'] || item['Name'] || item['name'] || item['Ləqəb']
    const breed = item['Cins'] || item['Breed'] || item['breed'] || item['Növ']
    const genderRaw = String(item['Cinsiyyət'] || item['Gender'] || item['gender'] || item['Cinsiyyet'] || 'FEMALE').toUpperCase()
    const gender = (genderRaw === 'ERKƏK' || genderRaw === 'MALE' || genderRaw === 'ERKEK') ? 'MALE' : 'FEMALE'
    const birthDateValue = item['Doğum Tarixi'] || item['Doğum'] || item['Birth Date'] || item['birthDate'] || item['Dogum']
    const groupName = item['Qrup'] || item['Group'] || item['groupName'] || 'SAĞMAL 1'

    let birthDate = null
    if (birthDateValue) {
      // Excel serial date check
      if (typeof birthDateValue === 'number') {
        const d = new Date((birthDateValue - 25569) * 86400 * 1000)
        if (!isNaN(d.getTime())) birthDate = d
      } else {
        const d = new Date(birthDateValue)
        if (!isNaN(d.getTime())) birthDate = d
      }
    }

    await prisma.animal.upsert({
      where: { 
        tagNumber_farmId: {
          tagNumber,
          farmId: farmIdToUse
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
        farmId: farmIdToUse
      }
    })
    count++
  }

  revalidatePath('/herd')
  return { success: true, importedCount: count }
}


export async function addHealthAction(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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
        farmId: farmIdToUse,
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

export async function updateHealthAction(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  const dateStr = formData.get('date') as string;
  const type = formData.get('type') as string;
  const disease = formData.get('disease') as string;
  const description = formData.get('description') as string;
  const treatment = formData.get('treatment') as string;
  const medications = formData.get('medications') as string;
  const vetName = formData.get('vetName') as string;
  const cost = parseFloat(formData.get('cost') as string || '0');

  await prisma.healthRecord.update({
    where: { id, animal: { farmId: farmIdToUse } },
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

export async function deleteHealthAction(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.healthRecord.delete({
    where: { id, animal: { farmId: farmIdToUse } }
  });
  revalidatePath('/', 'layout');
}

export async function addVaccineAction(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  const animalId = formData.get('animalId') as string;
  const vaccineName = formData.get('vaccineName') as string;
  const dateStr = formData.get('date') as string;
  const nextDueDateStr = formData.get('nextDueDate') as string;
  const dose = formData.get('dose') as string;
  const notes = formData.get('notes') as string;

  await prisma.vaccineRecord.create({
    data: {
      animalId,
      vaccineName,
      date: new Date(dateStr),
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr) : null,
      dose,
      notes
    }
  });
  revalidatePath('/', 'layout');
}

export async function deleteVaccineAction(id: string, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  await prisma.vaccineRecord.delete({
    where: { id, animal: { farmId: farmIdToUse } }
  });
  revalidatePath('/', 'layout');
}

export async function addMassVaccineAction(formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
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

export async function updateVaccineAction(id: string, formData: FormData, targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId)
  const vaccineName = formData.get('vaccineName') as string;
  const dateStr = formData.get('date') as string;
  const nextDueDateStr = formData.get('nextDueDate') as string;
  const dose = formData.get('dose') as string;
  const notes = formData.get('notes') as string;

  await prisma.vaccineRecord.update({
    where: { id },
    data: {
      vaccineName,
      date: new Date(dateStr),
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr) : null,
      dose,
      notes
    }
  });
  revalidatePath('/', 'layout');
}

export async function seedDemoData(targetFarmId?: string) {
  const farmIdToUse = await getFarmId(targetFarmId);
  
  // Check if already has animals to avoid duplicates
  const existingCount = await prisma.animal.count({ where: { farmId: farmIdToUse } });
  if (existingCount > 10) return { success: false, message: "Artıq kifayət qədər məlumat var." };

  const breeds = ['Holstein', 'Simmental', 'Jersey', 'Ayrshire'];
  const groups = ['SAĞMAL 1', 'SAĞMAL 2', 'QURUYA ÇIXANLAR', 'BUZOVLAR', 'DANALAR', 'DÜYƏLƏR'];

  const animalsToCreate = [];

  // Generate 75 animals
  for (let i = 1; i <= 75; i++) {
    const isCalf = i > 60;
    const tagNumber = `AZ${10000 + i}`;
    const breed = breeds[Math.floor(Math.random() * breeds.length)];
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - (isCalf ? 0 : Math.floor(Math.random() * 5) + 2));
    if (isCalf) birthDate.setMonth(birthDate.getMonth() - Math.floor(Math.random() * 6));

    let groupName = groups[Math.floor(Math.random() * 3)]; // Default to milking/dry
    if (isCalf) groupName = 'BUZOVLAR';

    animalsToCreate.push({
      tagNumber,
      name: `Heyvan ${i}`,
      breed,
      gender: 'FEMALE',
      stage: isCalf ? 'CALF' : 'ACTIVE',
      groupName,
      birthDate,
      farmId: farmIdToUse,
      isPregnant: !isCalf && Math.random() > 0.6,
      isDry: !isCalf && Math.random() > 0.8
    });
  }

  await prisma.animal.createMany({
    data: animalsToCreate
  });

  revalidatePath('/herd');
  return { success: true, count: 75 };
}
