import { Animal } from '@prisma/client';

export interface TaskItem {
  id: string;
  type: 'VACCINE' | 'CALVING' | 'HEALTH' | 'FEED' | 'REPRO';
  title: string;
  description: string;
  dueDate: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  link?: string;
}

export function generateAutomatedTasks(
  animals: any[], 
  feeds: any[]
): TaskItem[] {
  const tasks: TaskItem[] = [];
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Vaccine Reminders
  animals.forEach(animal => {
    animal.vaccineRecords?.forEach((vaccine: any) => {
      if (vaccine.nextDueDate) {
        const dueDate = new Date(vaccine.nextDueDate);
        if (dueDate <= nextWeek && dueDate >= today) {
          tasks.push({
            id: `vac_${vaccine.id}`,
            type: 'VACCINE',
            title: 'Vaksinasiya Vaxtı',
            description: `${animal.tagNumber} nömrəli heyvan üçün "${vaccine.vaccineName}" vaksini.`,
            dueDate: dueDate,
            priority: 'HIGH',
            link: `/herd?id=${animal.id}`
          });
        }
      }
    });
  });

  // 2. Calving Alerts
  animals.forEach(animal => {
    if (animal.isPregnant && animal.expectedCalvingDate) {
      const calvingDate = new Date(animal.expectedCalvingDate);
      if (calvingDate <= nextWeek) {
        tasks.push({
          id: `calv_${animal.id}`,
          type: 'CALVING',
          title: 'Doğum Yaxınlaşır',
          description: `${animal.tagNumber} nömrəli heyvanın təxmini doğum vaxtı gəlib çatır.`,
          dueDate: calvingDate,
          priority: 'HIGH',
          link: `/herd?id=${animal.id}`
        });
      }
    }
  });

  // 3. Dry Off Reminders (e.g. 60 days before calving)
  animals.forEach(animal => {
    if (animal.isPregnant && animal.expectedCalvingDate && !animal.isDry) {
      const calvingDate = new Date(animal.expectedCalvingDate);
      const dryDate = new Date(calvingDate.getTime() - 60 * 24 * 60 * 60 * 1000);
      if (dryDate <= nextWeek && dryDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        tasks.push({
          id: `dry_${animal.id}`,
          type: 'REPRO',
          title: 'Quruya Çıxarma',
          description: `${animal.tagNumber} nömrəli heyvanı quruya çıxarmaq vaxtıdır.`,
          dueDate: dryDate,
          priority: 'MEDIUM',
          link: `/herd?id=${animal.id}`
        });
      }
    }
  });

  // 4. Pregnancy Check (PD) - e.g. 35 days after insemination
  animals.forEach(animal => {
    const lastAI = animal.reproRecords?.find((r: any) => r.eventType === 'INSEMINATION');
    const lastCalving = animal.calvingRecords?.[0];
    
    if (lastAI && !animal.isPregnant) {
      const aiDate = new Date(lastAI.date);
      const isNotCalvedAfterAI = !lastCalving || new Date(lastCalving.date) < aiDate;
      
      if (isNotCalvedAfterAI) {
        const pdDate = new Date(aiDate.getTime() + 35 * 24 * 60 * 60 * 1000);
        if (pdDate <= nextWeek && pdDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
          tasks.push({
            id: `pd_${lastAI.id}`,
            type: 'REPRO',
            title: 'Hamiləlik Yoxlanışı (PD)',
            description: `${animal.tagNumber} nömrəli heyvan mayalanmadan sonra yoxlanılmalıdır.`,
            dueDate: pdDate,
            priority: 'HIGH',
            link: `/herd?id=${animal.id}`
          });
        }
      }
    }
  });

  // 5. Feed Stock Alerts
  feeds.forEach(feed => {
    if (feed.stock <= (feed.minStock || 50)) {
      tasks.push({
        id: `feed_${feed.id}`,
        type: 'FEED',
        title: 'Kritik Yem Stoku',
        description: `"${feed.name}" yemi bitmək üzrədir (${feed.stock.toFixed(0)} ${feed.unit} qalıb).`,
        dueDate: today,
        priority: feed.stock === 0 ? 'HIGH' : 'MEDIUM',
        link: '/feeding'
      });
    }
  });

  return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
