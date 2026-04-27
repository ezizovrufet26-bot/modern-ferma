import { auth } from '@/auth'
import prisma from './prisma'

export async function getSession() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Daxil olmayıbsınız")
  }
  return session
}

export async function getFarmId(targetFarmId?: string) {
  const session = await getSession()
  
  // Super Admin logic
  if (session.user.role === 'SUPER_ADMIN') {
    if (targetFarmId) return targetFarmId;
    if (session.user.farmId) return session.user.farmId as string;
    
    // If Super Admin has no farm assigned, pick the first available farm
    const firstFarm = await prisma.farm.findFirst();
    if (!firstFarm) throw new Error("Sistemdə heç bir fərma tapılmadı");
    console.log("Resolved FarmId for Super Admin:", firstFarm.id);
    return firstFarm.id;
  }
  
  // Regular user logic
  if (!session.user.farmId) {
    throw new Error("Siz heç bir fərmaya bağlı deyilsiniz")
  }

  // Check Subscription Status
  const farm = await prisma.farm.findUnique({
    where: { id: session.user.farmId },
    select: { subscriptionStatus: true }
  });

  if (farm?.subscriptionStatus === 'EXPIRED') {
    throw new Error("Abunəlik müddətiniz bitib. Zəhmət olmasa ödəniş edin.");
  }
  
  return session.user.farmId as string;
}
