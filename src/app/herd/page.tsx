import { getAnimals, deleteAnimal, saveArtificialInsemination, saveCalving, updateArtificialInsemination, deleteArtificialInsemination, savePregnancyCheck, saveDryPeriod } from "@/app/actions/herd";
import { getStaff } from "@/app/actions/staff";
import { addHealthRecord, addVaccineRecord, updateAnimalGroup, addMassVaccineRecord, updateHealthRecord, deleteHealthRecord, updateVaccineRecord, deleteVaccineRecord } from "@/app/actions/health";
import HerdClient from "@/components/HerdClient";

export default async function HerdPage({ searchParams }: { searchParams: Promise<{ stage?: string; group?: string }> }) {
  let animals = await getAnimals();
  const staffList = await getStaff();
  const params = await searchParams;
  
  if (params.stage) {
    const stages = params.stage.split(',');
    animals = animals.filter(a => stages.includes(a.stage));
  }
  
  const initialGroup = params.group || null;

  return (
    <div className="bg-gray-50/50">
      <HerdClient 
        animals={animals} 
        deleteAction={deleteAnimal} 
        saveAIAction={saveArtificialInsemination} 
        updateAIAction={updateArtificialInsemination}
        deleteAIAction={deleteArtificialInsemination}
        saveCalvingAction={saveCalving}
        savePDAction={savePregnancyCheck}
        saveDryAction={saveDryPeriod}
        staffList={staffList}
        addHealthAction={addHealthRecord}
        updateHealthAction={updateHealthRecord}
        deleteHealthAction={deleteHealthRecord}
        addVaccineAction={addVaccineRecord}
        updateVaccineAction={updateVaccineRecord}
        deleteVaccineAction={deleteVaccineRecord}
        addMassVaccineAction={addMassVaccineRecord}
        updateGroupAction={updateAnimalGroup}
        initialGroup={initialGroup}
      />
    </div>
  );
}
