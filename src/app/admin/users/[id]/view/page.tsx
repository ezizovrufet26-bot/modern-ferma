import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import HerdClient from "@/components/HerdClient";
import FeedingClient from "@/components/FeedingClient";
import FinanceClient from "@/components/FinanceClient";
import StaffClient from "@/components/StaffClient";
import MilkClient from "@/components/MilkClient";
import { getAnimalGroup } from "@/lib/herd-utils";

import { getAnimals, deleteAnimal, saveArtificialInsemination, updateArtificialInsemination, deleteArtificialInsemination, saveCalving, savePregnancyCheck, saveDryPeriod } from "@/app/actions/herd";
import { addHealthRecord, updateHealthRecord, deleteHealthRecord, addVaccineRecord, updateVaccineRecord, deleteVaccineRecord, updateAnimalGroup, addMassVaccineRecord } from "@/app/actions/health";
import { 
  getFeeds, addFeed, updateFeed, deleteFeed,
  getRations, createRation, updateRation, deleteRation,
  addFeedingRecord, updateFeedingRecord, deleteFeedingRecord, getFeedingRecords 
} from "@/app/actions/feeding";
import { getFinanceRecords, addFinanceRecord, deleteFinanceRecord, updateFinanceRecord } from "@/app/actions/finance";
import { getStaff } from "@/app/actions/staff";
import { getMilkRecords, addMilkRecord, deleteMilkRecord, updateMilkRecord } from "@/app/actions/milk";
import { addHealthAction, deleteHealthAction, addVaccineAction, addMassVaccineAction } from "@/app/actions/herd";
import HealthClient from "@/components/HealthClient";

import Link from "next/link";
import { ArrowLeft, User as UserIcon, Database, Wheat, Banknote, ShieldCheck, Droplets, Activity } from "lucide-react";

export default async function UserDashboardView({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ tab?: string }> 
}) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect("/");
  }

  const { id: userId } = await params;
  const { tab = 'herd' } = await searchParams;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, id: true }
  });

  if (!targetUser) notFound();

  // Pre-fetch animals for counts
  const animals = await getAnimals(userId);
  const groupCounts: Record<string, number> = {};
  animals.forEach((a: any) => {
    const group = getAnimalGroup(a);
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gray-900 text-white p-6 shadow-2xl z-30 shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Link href="/admin/users" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">{targetUser.name} <span className="text-blue-400 font-medium ml-2">#{targetUser.id.slice(-4)}</span></h1>
                <p className="text-gray-400 font-bold text-sm">{targetUser.email} — <span className="text-amber-400 uppercase text-[10px] tracking-widest">Admin Baxış Modu</span></p>
              </div>
            </div>
          </div>

          <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5">
             <div className="px-6 py-2 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Super Admin Rejimi: AKTİV
             </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm overflow-x-auto shrink-0">
        <div className="max-w-[1600px] mx-auto flex gap-4">
           <Link href={`/admin/users/${userId}/view?tab=herd`} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${tab === 'herd' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Database className="w-4 h-4" /> Sürü
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=milk`} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${tab === 'milk' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Droplets className="w-4 h-4" /> Süd
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=feeding`} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${tab === 'feeding' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Wheat className="w-4 h-4" /> Yemləmə
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=finance`} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${tab === 'finance' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Banknote className="w-4 h-4" /> Maliyyə
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=staff`} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${tab === 'staff' ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <UserIcon className="w-4 h-4" /> Heyət
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=health_all`} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${tab === 'health_all' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Activity className="w-4 h-4" /> Sağlamlıq
           </Link>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {tab === 'herd' && (
          <HerdClient 
            animals={animals as any} 
            staffList={await getStaff(userId)}
            targetUserId={userId}
            deleteAction={deleteAnimal}
            saveAIAction={saveArtificialInsemination}
            updateAIAction={updateArtificialInsemination}
            deleteAIAction={deleteArtificialInsemination}
            saveCalvingAction={saveCalving}
            savePDAction={savePregnancyCheck}
            saveDryAction={saveDryPeriod}
            addHealthAction={addHealthRecord}
            updateHealthAction={updateHealthRecord}
            deleteHealthAction={deleteHealthRecord}
            addVaccineAction={addVaccineRecord}
            updateVaccineAction={updateVaccineRecord}
            deleteVaccineAction={deleteVaccineRecord}
            addMassVaccineAction={addMassVaccineRecord}
            updateGroupAction={updateAnimalGroup}
          />
        )}

        {tab === 'feeding' && (
          <FeedingClient 
            initialFeeds={await getFeeds(userId)}
            initialRations={await getRations(userId)}
            initialHistory={await getFeedingRecords(userId)}
            groupCounts={groupCounts}
            getFeedsAction={getFeeds}
            getRationsAction={getRations}
            getFeedingRecordsAction={getFeedingRecords}
            addFeedAction={addFeed}
            updateFeedAction={updateFeed}
            deleteFeedAction={deleteFeed}
            createRationAction={createRation}
            updateRationAction={updateRation}
            deleteRationAction={deleteRation}
            addFeedingRecordAction={addFeedingRecord}
            updateFeedingRecordAction={updateFeedingRecord}
            deleteFeedingRecordAction={deleteFeedingRecord}
            targetUserId={userId}
          />
        )}

        {tab === 'milk' && (
          <MilkClient 
            animals={animals as any}
            initialRecords={await getMilkRecords(userId)}
            addAction={addMilkRecord}
            deleteAction={deleteMilkRecord}
            updateAction={updateMilkRecord}
            targetUserId={userId}
          />
        )}

        {tab === 'finance' && (
          <FinanceClient 
            initialRecords={await getFinanceRecords(userId)}
            staffList={await getStaff(userId)}
            addAction={addFinanceRecord}
            deleteAction={deleteFinanceRecord}
            updateAction={updateFinanceRecord}
            targetUserId={userId}
          />
        )}


        {tab === 'staff' && (
          <StaffClient 
            initialStaff={await getStaff(userId)}
            createAction={require('@/app/actions/staff').createStaff}
            deleteAction={require('@/app/actions/staff').deleteStaff}
            targetUserId={userId}
          />
        )}

        {tab === 'health_all' && (
           <HealthClient 
             animals={animals}
             healthRecords={animals.flatMap((a: any) => a.healthRecords.map((r: any) => ({ ...r, animal: a })))}
             vaccineRecords={animals.flatMap((a: any) => a.vaccineRecords.map((r: any) => ({ ...r, animal: a })))}
             addHealthAction={addHealthAction}
             updateHealthAction={require('@/app/actions/herd').updateHealthAction}
             deleteHealthAction={deleteHealthAction}
             addVaccineAction={addVaccineAction}
             updateVaccineAction={require('@/app/actions/herd').updateVaccineAction}
             deleteVaccineAction={require('@/app/actions/herd').deleteVaccineAction}
             addMassVaccineAction={addMassVaccineAction}
             targetUserId={userId}
           />
        )}
      </main>
    </div>
  );
}
