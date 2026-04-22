'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// UNIVERSAL USER ID RESOLVER
async function getTargetUserId(targetUserId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Daxil olmayıbsınız")
  if (targetUserId && session.user.role === 'ADMIN') return targetUserId
  return session.user.id
}

// FEED ITEMS
export async function getFeeds(targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  return await prisma.feedItem.findMany({
    where: { userId: userIdToUse },
    orderBy: { name: 'asc' }
  })
}

function countSetBits(n: number) {
  let count = 0;
  while (n > 0) {
    n &= (n - 1);
    count++;
  }
  return count;
}

export async function addFeed(data: { name: string, unit: string, costPerUnit: number, stock: number }, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const feed = await prisma.feedItem.create({
    data: { ...data, userId: userIdToUse }
  })
  revalidatePath('/feeding')
  return feed
}

// RATIONS
export async function getRations(targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  return await prisma.ration.findMany({
    where: { userId: userIdToUse },
    include: { items: { include: { feedItem: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createRation(name: string, description: string, items: { feedItemId: string, amount: number }[], targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const ration = await prisma.ration.create({
    data: {
      name,
      description,
      userId: userIdToUse,
      items: {
        create: items.map(item => ({
          feedItemId: item.feedItemId,
          amount: item.amount
        }))
      }
    }
  })
  revalidatePath('/feeding')
  return ration
}

// FEEDING RECORDS
export async function addFeedingRecord(data: { 
  groupName: string, 
  animalCount: number, 
  rationId: string,
  frequency?: number,
  completedMeals?: number
}, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const frequency = data.frequency !== undefined ? data.frequency : 3
  const completedMeals = data.completedMeals !== undefined ? data.completedMeals : frequency
  
  const ration = await prisma.ration.findUnique({
    where: { id: data.rationId },
    include: { items: { include: { feedItem: true } } }
  })

  if (!ration) throw new Error("Rasion tapılmadı")

  const costPerAnimalPerDay = ration.items.reduce((acc, item) => acc + (item.amount * item.feedItem.costPerUnit), 0)
  const totalDailyCost = costPerAnimalPerDay * data.animalCount
  const actualCost = (totalDailyCost / frequency) * countSetBits(completedMeals)

  const record = await prisma.feedingRecord.create({
    data: {
      groupName: data.groupName,
      animalCount: data.animalCount,
      rationId: data.rationId,
      totalCost: actualCost,
      userId: userIdToUse
    }
  })

  await prisma.$executeRawUnsafe(
    `UPDATE FeedingRecord SET frequency = ?, completedMeals = ? WHERE id = ?`,
    frequency, completedMeals, record.id
  )

  await prisma.financeRecord.create({
    data: {
      type: 'EXPENSE',
      category: 'YEM',
      amount: actualCost,
      description: `${data.groupName} qrupunun yemlənməsi (${ration.name}) - ${countSetBits(completedMeals)}/${frequency} yemləmə`,
      date: new Date(),
      userId: userIdToUse
    }
  })

  for (const item of ration.items) {
    const amountUsed = (item.amount * data.animalCount / frequency) * countSetBits(completedMeals)
    await prisma.feedItem.update({
      where: { id: item.feedItemId },
      data: { stock: { decrement: amountUsed } }
    })
  }

  revalidatePath('/')
  return record
}

// UPDATE & DELETE ACTIONS
export async function updateFeed(id: string, data: { name: string, unit: string, costPerUnit: number, stock: number }, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const feed = await prisma.feedItem.update({
    where: { id, userId: userIdToUse },
    data
  })
  revalidatePath('/feeding')
  return feed
}

export async function deleteFeed(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  await prisma.feedItem.delete({ where: { id, userId: userIdToUse } })
  revalidatePath('/feeding')
}

export async function updateRation(id: string, name: string, description: string, items: { feedItemId: string, amount: number }[], targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  await prisma.rationItem.deleteMany({ where: { rationId: id } })
  
  const ration = await prisma.ration.update({
    where: { id, userId: userIdToUse },
    data: {
      name,
      description,
      items: {
        create: items.map(item => ({
          feedItemId: item.feedItemId,
          amount: item.amount
        }))
      }
    }
  })
  revalidatePath('/feeding')
  return ration
}

export async function deleteRation(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  await prisma.ration.delete({ where: { id, userId: userIdToUse } })
  revalidatePath('/feeding')
}

export async function updateFeedingRecord(id: string, data: { 
  groupName: string, 
  animalCount: number, 
  rationId: string,
  frequency?: number,
  completedMeals?: number
}, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const frequency = data.frequency !== undefined ? data.frequency : 3
  const completedMeals = data.completedMeals !== undefined ? data.completedMeals : frequency
  
  const oldRecord = await prisma.feedingRecord.findUnique({ where: { id, userId: userIdToUse } })
  if (oldRecord) {
     await prisma.financeRecord.deleteMany({
       where: { 
         userId: userIdToUse,
         description: { contains: oldRecord.groupName },
         amount: oldRecord.totalCost,
         category: 'YEM'
       }
     })
  }

  const ration = await prisma.ration.findUnique({
    where: { id: data.rationId },
    include: { items: { include: { feedItem: true } } }
  })

  if (!ration) throw new Error("Rasion tapılmadı")

  const costPerAnimalPerDay = ration.items.reduce((acc, item) => acc + (item.amount * item.feedItem.costPerUnit), 0)
  const totalDailyCost = costPerAnimalPerDay * data.animalCount
  const actualCost = (totalDailyCost / frequency) * countSetBits(completedMeals)

  const record = await prisma.feedingRecord.update({
    where: { id, userId: userIdToUse },
    data: {
      groupName: data.groupName,
      animalCount: data.animalCount,
      rationId: data.rationId,
      totalCost: actualCost
    }
  })

  // Use raw SQL to bypass Prisma client field filtering if stale
  await prisma.$executeRawUnsafe(
    `UPDATE FeedingRecord SET frequency = ?, completedMeals = ? WHERE id = ?`,
    frequency, completedMeals, id
  )

  await prisma.financeRecord.create({
    data: {
      type: 'EXPENSE',
      category: 'YEM',
      amount: actualCost,
      description: `${data.groupName} qrupunun yemlənməsi (${ration.name}) - ${countSetBits(completedMeals)}/${frequency} Düzəliş`,
      date: new Date(),
      userId: userIdToUse
    }
  })

  revalidatePath('/')
  revalidatePath('/feeding')
  return record
}

export async function deleteFeedingRecord(id: string, targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  const record = await prisma.feedingRecord.findUnique({ where: { id, userId: userIdToUse } })
  if (record) {
    await prisma.financeRecord.deleteMany({
      where: { 
        userId: userIdToUse,
        description: { contains: record.groupName },
        amount: record.totalCost,
        category: 'YEM'
      }
    })
    await prisma.feedingRecord.delete({ where: { id, userId: userIdToUse } })
  }
  revalidatePath('/feeding')
  revalidatePath('/finance')
}
export async function getFeedingRecords(targetUserId?: string) {
  const userIdToUse = await getTargetUserId(targetUserId)
  
  // Use raw SQL to get all fields including new ones that might be filtered by a stale Prisma client
  const records = await prisma.$queryRawUnsafe(`
    SELECT fr.*, r.name as rationName
    FROM FeedingRecord fr
    LEFT JOIN Ration r ON fr.rationId = r.id
    WHERE fr.userId = ?
    ORDER BY fr.date DESC
    LIMIT 50
  `, userIdToUse)

  // Map to match expected UI structure (include ration object)
  return (records as any[]).map(r => ({
    ...r,
    ration: { id: r.rationId, name: r.rationName, items: [] } // Items will be empty but weights are handled by ?? logic
  }))
}
