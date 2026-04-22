import HealthClient from "@/components/HealthClient";
import { 
  getAnimals, addHealthAction, updateHealthAction, deleteHealthAction, 
  addVaccineAction, updateVaccineAction, deleteVaccineAction, addMassVaccineAction 
} from "@/app/actions/herd";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const animals = await getAnimals();

  return (
    <HealthClient 
      animals={animals}
      healthRecords={animals.flatMap((a: any) => a.healthRecords.map((r: any) => ({ ...r, animal: a })))}
      vaccineRecords={animals.flatMap((a: any) => a.vaccineRecords.map((r: any) => ({ ...r, animal: a })))}
      addHealthAction={addHealthAction}
      updateHealthAction={updateHealthAction}
      deleteHealthAction={deleteHealthAction}
      addVaccineAction={addVaccineAction}
      updateVaccineAction={updateVaccineAction}
      deleteVaccineAction={deleteVaccineAction}
      addMassVaccineAction={addMassVaccineAction}
    />
  );
}
