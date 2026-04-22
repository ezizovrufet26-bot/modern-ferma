import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addVaccineToRufet() {
  try {
    // 1. Rufet Admin istifadəçisini tapırıq (Bayaq tapdığımız ID)
    const userId = '643a39ee-d0b3-487c-8401-20f1626d11d1';
    
    // 2. Rufetin heyvanlarını tapırıq
    const animals = await prisma.animal.findMany({
      where: { userId },
      take: 5
    });

    if (animals.length === 0) {
      console.log("Rufet Admin hesabında heyvan tapılmadı. Əvvəlcə 'Sürü' bölməsindən heyvan əlavə edilməlidir.");
      return;
    }

    console.log(`Rufet Admin üçün ${animals.length} heyvana 'Dabaq' vaksini (2 Aprel) əlavə edilir...`);

    const vaccineDate = new Date("2026-04-02");
    
    await prisma.vaccineRecord.createMany({
      data: animals.map(a => ({
        animalId: a.id,
        vaccineName: "Dabaq",
        date: vaccineDate,
        dose: "2ml",
        notes: "Rufet üçün birbaşa test"
      }))
    });

    console.log("Uğurla əlavə edildi!");

  } catch (error) {
    console.error("Xəta:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addVaccineToRufet();
