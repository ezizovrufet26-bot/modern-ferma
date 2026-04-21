export type Animal = {
  id: string;
  tagNumber: string;
  name: string | null;
  breed: string | null;
  stage: string;
  gender: string;
  birthDate: Date | null;
  motherId?: string | null;
  sireCode?: string | null;
  mother?: any;
  reproRecords?: any[];
  calvingRecords?: any[];
  healthRecords?: any[];
  vaccineRecords?: any[];
  children?: any[];
};

export const getAnimalGroup = (animal: any) => {
  const today = new Date();
  const birthDate = animal.birthDate ? new Date(animal.birthDate) : null;
  const ageInDays = birthDate ? Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)) : 1000;
  
  if (animal.gender === 'MALE') {
    if (ageInDays < 180) return 'BUZOVLAR';
    if (ageInDays < 450) return 'DANALAR';
    return 'DANALAR/BUĞALAR';
  }

  const lastCalving = animal.calvingRecords && animal.calvingRecords[0];
  const lastAI = animal.reproRecords && animal.reproRecords.find((r: any) => r.eventType === 'INSEMINATION');
  
  if (ageInDays < 180) return 'BUZOVLAR'; 
  
  if (lastAI) {
    const aiDate = new Date(lastAI.date);
    const isPregnant = !lastCalving || new Date(lastCalving.date) < aiDate;
    
    if (isPregnant) {
      const expectedCalving = new Date(aiDate.getTime() + (285 * 24 * 60 * 60 * 1000));
      const daysToCalving = Math.floor((expectedCalving.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToCalving <= 30 && daysToCalving > 0) return 'DOĞUMA 1 AY QALMIŞLAR';
      if (daysToCalving <= 60 && daysToCalving > 30) return 'QURUYA ÇIXANLAR';
    }
  }

  if (lastCalving) {
    const daysSinceCalving = Math.floor((today.getTime() - new Date(lastCalving.date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCalving <= 30) return 'YENİ DOĞANLAR';
    if (daysSinceCalving <= 150) return 'SAĞMAL 1';
    return 'SAĞMAL 2';
  }

  if (ageInDays < 450) return 'DANALAR';
  return 'DÜYƏLƏR';
};

export const calculateAge = (birthDate: Date | null) => {
  if (!birthDate) return 'Naməlum';
  const diff = new Date().getTime() - new Date(birthDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} gün`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay`;
  return `${Math.floor(months / 12)} il ${months % 12} ay`;
};
