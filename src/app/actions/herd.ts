'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getAnimals() {
  try {
    const animals = await prisma.animal.findMany({
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
        }
      }
    })
    return animals
  } catch (error) {
    console.error("Failed to fetch animals:", error)
    return []
  }
}

export async function createAnimal(formData: FormData) {
  const tagNumber = formData.get('tagNumber') as string
  const name = formData.get('name') as string
  const breed = formData.get('breed') as string
  const birthDateStr = formData.get('birthDate') as string
  const lastCalvingDateStr = formData.get('lastCalvingDate') as string
  const gender = formData.get('gender') as string || 'FEMALE'
  const motherInput = formData.get('motherId') as string
  const sireCode = formData.get('sireCode') as string

  let birthDate = birthDateStr ? new Date(birthDateStr) : null
  let stage = 'CALF'
  let motherId = null

  // Resolve Mother by Tag Number
  if (motherInput) {
    const mother = await prisma.animal.findFirst({
      where: { tagNumber: motherInput }
    })
    if (mother) motherId = mother.id
  }

  const animal = await prisma.animal.create({
    data: {
      tagNumber,
      name: name || null,
      breed: breed || null,
      gender,
      stage: 'CALF', // Initial, will update if needed
      birthDate,
      motherId,
      sireCode: sireCode || null
    }
  })

  // If last calving date is provided, create a calving record
  if (lastCalvingDateStr && gender === 'FEMALE') {
    const calvingDate = new Date(lastCalvingDateStr);
    const calfTag = formData.get('calfTag') as string;
    const calfGender = formData.get('calfGender') as string || 'FEMALE';
    
    let calfId = null;
    
    // Create the Calf if Tag is provided
    if (calfTag) {
      const calf = await prisma.animal.create({
        data: {
          tagNumber: calfTag,
          gender: calfGender,
          birthDate: calvingDate,
          motherId: animal.id,
          breed: breed || null,
          stage: 'CALF'
        }
      });
      calfId = calf.id;
    }

    await prisma.calvingRecord.create({
      data: {
        animalId: animal.id,
        date: calvingDate,
        parity: 1,
        calfGender: calfGender,
        calfId: calfId,
        notes: 'Sistemə ilk giriş zamanı əlavə edilən doğum'
      }
    });
  }

  revalidatePath('/herd')
  redirect('/herd')
}

export async function deleteAnimal(id: string) {
  await prisma.animal.delete({
    where: { id }
  })
  revalidatePath('/herd')
}

export async function getAnimal(id: string) {
  return await prisma.animal.findUnique({
    where: { id },
    include: {
      calvingRecords: {
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function updateAnimal(id: string, formData: FormData) {
  const tagNumber = formData.get('tagNumber') as string
  const name = formData.get('name') as string
  const breed = formData.get('breed') as string
  const birthDateStr = formData.get('birthDate') as string
  const lastCalvingDateStr = formData.get('lastCalvingDate') as string
  const gender = formData.get('gender') as string || 'FEMALE'
  const motherInput = formData.get('motherId') as string
  const sireCode = formData.get('sireCode') as string

  let birthDate = birthDateStr ? new Date(birthDateStr) : null
  let motherId = null

  if (motherInput) {
    const mother = await prisma.animal.findFirst({
      where: { tagNumber: motherInput }
    })
    if (mother) motherId = mother.id
  }

  const animal = await prisma.animal.update({
    where: { id },
    data: {
      tagNumber,
      name: name || null,
      breed: breed || null,
      gender,
      stage: 'CALF', // Will be re-calculated in UI logic
      birthDate,
      motherId,
      sireCode: sireCode || null
    }
  })

  // Update or create calving record if provided
  if (lastCalvingDateStr && gender === 'FEMALE') {
    const existingCalving = await prisma.calvingRecord.findFirst({
      where: { animalId: id },
      orderBy: { date: 'desc' }
    });

    if (existingCalving) {
      await prisma.calvingRecord.update({
        where: { id: existingCalving.id },
        data: { date: new Date(lastCalvingDateStr) }
      });
    } else {
      await prisma.calvingRecord.create({
        data: {
          animalId: id,
          date: new Date(lastCalvingDateStr),
          parity: 1
        }
      });
    }
  }

  revalidatePath('/herd')
  redirect('/herd')
}

export async function saveArtificialInsemination(formData: FormData) {
  const animalId = formData.get('animalId') as string;
  const dateStr = formData.get('inseminationDate') as string;
  const sireCode = formData.get('sireCode') as string;
  const vetId = formData.get('vetId') as string;

  await prisma.reproductionRecord.create({
    data: {
      animalId,
      date: new Date(dateStr),
      eventType: 'INSEMINATION',
      vetId: vetId || null,
      notes: JSON.stringify({ sireCode })
    }
  });

  revalidatePath('/herd');
}

export async function saveCalving(formData: FormData) {
  const motherId = formData.get('motherId') as string;
  const dateStr = formData.get('calvingDate') as string;
  const calfTag = formData.get('calfTag') as string;
  const calfGender = formData.get('calfGender') as string;
  const calfBreed = formData.get('calfBreed') as string;
  const notes = formData.get('notes') as string;

  const calvingDate = new Date(dateStr);

  // 1. Create the Calf as a new Animal
  let calfId = null;
  if (calfTag) {
    const calf = await prisma.animal.create({
      data: {
        tagNumber: calfTag,
        gender: calfGender,
        birthDate: calvingDate,
        motherId: motherId,
        breed: calfBreed || null,
        stage: 'CALF'
      }
    });
    calfId = calf.id;
  }

  // 2. Create the Calving Record for the mother
  await prisma.calvingRecord.create({
    data: {
      animalId: motherId,
      date: calvingDate,
      calfGender: calfGender,
      calfId: calfId,
      notes: notes || null
    }
  });

  revalidatePath('/herd');
  revalidatePath('/');
}
export async function updateArtificialInsemination(id: string, formData: FormData) {
  const dateStr = formData.get('inseminationDate') as string;
  const sireCode = formData.get('sireCode') as string;
  const vetId = formData.get('vetId') as string;

  await prisma.reproductionRecord.update({
    where: { id },
    data: {
      date: new Date(dateStr),
      vetId: vetId || null,
      notes: JSON.stringify({ sireCode })
    }
  });

  revalidatePath('/herd');
}

export async function deleteArtificialInsemination(id: string) {
  await prisma.reproductionRecord.delete({ where: { id } });
  revalidatePath('/herd');
}
