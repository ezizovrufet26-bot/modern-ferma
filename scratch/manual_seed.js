
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const farm = await prisma.farm.findFirst();
  if (!farm) {
    console.log("No farm found!");
    return;
  }

  console.log(`Seeding data for farm: ${farm.name} (${farm.id})`);

  const breeds = ['Holstein', 'Simmental', 'Jersey', 'Ayrshire'];
  const groups = ['SAĞMAL 1', 'SAĞMAL 2', 'QURUYA ÇIXANLAR', 'BUZOVLAR', 'DANALAR', 'DÜYƏLƏR'];

  const animalsToCreate = [];

  for (let i = 1; i <= 75; i++) {
    const isCalf = i > 60;
    const tagNumber = `AZ${10000 + i}`;
    const breed = breeds[Math.floor(Math.random() * breeds.length)];
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - (isCalf ? 0 : Math.floor(Math.random() * 5) + 2));
    if (isCalf) birthDate.setMonth(birthDate.getMonth() - Math.floor(Math.random() * 6));

    let groupName = groups[Math.floor(Math.random() * 3)];
    if (isCalf) groupName = 'BUZOVLAR';

    animalsToCreate.push({
      tagNumber,
      name: `Heyvan ${i}`,
      breed,
      gender: 'FEMALE',
      stage: isCalf ? 'CALF' : 'ACTIVE',
      groupName,
      birthDate,
      farmId: farm.id,
      isPregnant: !isCalf && Math.random() > 0.6,
      isDry: !isCalf && Math.random() > 0.8
    });
  }

  await prisma.animal.createMany({
    data: animalsToCreate
  });

  console.log("75 animals seeded successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
