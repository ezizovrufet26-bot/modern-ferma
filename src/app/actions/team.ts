'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from "bcryptjs"
import { getFarmId } from '@/lib/auth-utils'

async function getTeamContext(targetFarmId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Daxil olmayıbsınız")
  
  // Super Admin context
  if (session.user.role === 'SUPER_ADMIN') {
    if (targetFarmId) return { farmId: targetFarmId, userId: session.user.id };
    // Fallback if super admin is viewing their own team (rare)
    return { farmId: session.user.farmId as string, userId: session.user.id };
  }

  // Farm Admin context
  if (session.user.role !== 'FARM_ADMIN') {
    throw new Error("Yalnız fərma adminləri komanda üzvlərini idarə edə bilər")
  }
  if (!session.user.farmId) {
    throw new Error("Fərma tapılmadı")
  }
  return { userId: session.user.id, farmId: session.user.farmId }
}

export async function getTeamUsers(targetFarmId?: string) {
  const { farmId } = await getTeamContext(targetFarmId)
  return await prisma.user.findMany({
    where: { farmId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })
}

export async function addTeamUser(formData: FormData, targetFarmId?: string) {
  const { farmId } = await getTeamContext(targetFarmId)
  
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string || 'FARM_USER'

  if (!email || !password) throw new Error("Email və şifrə vacibdir")

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
      farmId,
      isActive: true
    }
  })

  revalidatePath('/team')
}

export async function deleteTeamUser(id: string, targetFarmId?: string) {
  const { farmId, userId } = await getTeamContext(targetFarmId)
  
  // Prevent self-deletion
  if (id === userId) throw new Error("Özünüzü silə bilməzsiniz")

  await prisma.user.delete({
    where: { 
      id,
      farmId
    }
  })

  revalidatePath('/team')
}

export async function toggleTeamUserStatus(id: string, currentStatus: boolean, targetFarmId?: string) {
  const { farmId, userId } = await getTeamContext(targetFarmId)
  
  if (id === userId) throw new Error("Öz statusunuzu dəyişə bilməzsiniz")

  await prisma.user.update({
    where: { id, farmId },
    data: { isActive: !currentStatus }
  })

  revalidatePath('/team')
}
