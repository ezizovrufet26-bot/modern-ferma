import { getMilkRecords, addMilkRecord, deleteMilkRecord, updateMilkRecord } from "@/app/actions/milk";
import { getAnimals } from "@/app/actions/herd";
import MilkClient from "@/components/MilkClient";

export default async function MilkPage() {
  const records = await getMilkRecords();
  const animals = await getAnimals();

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <MilkClient 
        animals={animals}
        initialRecords={records}
        addAction={addMilkRecord}
        deleteAction={deleteMilkRecord}
        updateAction={updateMilkRecord}
      />
    </div>
  );
}
