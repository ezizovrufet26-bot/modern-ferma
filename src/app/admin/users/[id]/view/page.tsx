import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import HerdClient from "@/components/HerdClient";
import FeedingClient from "@/components/FeedingClient";
import FinanceClient from "@/components/FinanceClient";
import StaffClient from "@/components/StaffClient";
import MilkClient from "@/components/MilkClient";
import HealthClient from "@/components/HealthClient";
import TeamClient from "@/components/TeamClient";
import { getAnimalGroup } from "@/lib/herd-utils";

import { 
  getAnimals, 
  deleteAnimal, 
  saveArtificialInsemination, 
  updateArtificialInsemination, 
  deleteArtificialInsemination, 
  saveCalving, 
  savePregnancyCheck, 
  saveDryPeriod,
  addHealthAction, 
  updateHealthAction,
  deleteHealthAction, 
  addVaccineAction, 
  updateVaccineAction,
  deleteVaccineAction,
  addMassVaccineAction 
} from "@/app/actions/herd";
import { updateAnimalGroup } from "@/app/actions/health";
import { 
  getFeeds, addFeed, updateFeed, deleteFeed,
  getRations, createRation, updateRation, deleteRation,
  addFeedingRecord, updateFeedingRecord, deleteFeedingRecord, getFeedingRecords 
} from "@/app/actions/feeding";
import { getFinanceRecords, addFinanceRecord, deleteFinanceRecord, updateFinanceRecord } from "@/app/actions/finance";
import { getStaff, createStaff, deleteStaff } from "@/app/actions/staff";
import { getMilkRecords, addMilkRecord, deleteMilkRecord, updateMilkRecord } from "@/app/actions/milk";
import { getTeamUsers } from "@/app/actions/team";

import Link from "next/link";
import { ArrowLeft, User as UserIcon, Database, Wheat, Banknote, ShieldCheck, Droplets, Activity, Users } from "lucide-react";

export default async function UserDashboardView({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ tab?: string }> 
}) {
  const session = await auth();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/");
  }

  const { id: userId } = await params;
  const { tab = 'herd' } = await searchParams;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { farm: true }
  });

  if (!targetUser || !targetUser.farmId) notFound();
  
  const farmId = targetUser.farmId;

  // Pre-fetch animals for counts using farmId
  const animals = await getAnimals(farmId);
  const groupCounts: Record<string, number> = {};
  animals.forEach((a: any) => {
    const group = getAnimalGroup(a);
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gray-900 text-white p-4 md:p-6 shadow-2xl z-30 shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <Link href="/admin/users" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all shrink-0">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                <UserIcon className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg md:text-2xl font-black tracking-tight truncate">{targetUser.farm?.name || targetUser.name}</h1>
                <p className="text-gray-400 font-bold text-[10px] md:text-sm truncate">Admin: {targetUser.name} ({targetUser.email})</p>
              </div>
            </div>
          </div>

          <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-hidden">
             <div className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-blue-600 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 md:w-4 h-3 md:h-4" /> <span className="hidden sm:inline">Super Admin Rejimi:</span> AKTİV
             </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm overflow-x-auto shrink-0 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto flex gap-2 p-3 md:gap-4 md:p-4 whitespace-nowrap">
           <Link href={`/admin/users/${userId}/view?tab=herd`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'herd' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Database className="w-3.5 h-3.5 md:w-4 md:h-4" /> Sürü
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=milk`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'milk' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Droplets className="w-3.5 h-3.5 md:w-4 md:h-4" /> Süd
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=feeding`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'feeding' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Wheat className="w-3.5 h-3.5 md:w-4 md:h-4" /> Yemləmə
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=finance`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'finance' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Banknote className="w-3.5 h-3.5 md:w-4 md:h-4" /> Maliyyə
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=health_all`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'health_all' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4" /> Sağlamlıq
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=users`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'users' ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> İstifadəçilər
           </Link>
           <Link href={`/admin/users/${userId}/view?tab=staff`} className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider border transition-all ${tab === 'staff' ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
              <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> Heyət
           </Link>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {tab === 'herd' && (
          <HerdClient 
            animals={animals as any} 
            staffList={await getStaff(farmId)}
            targetFarmId={farmId}
            deleteAction={deleteAnimal}
            saveAIAction={saveArtificialInsemination}
            updateAIAction={updateArtificialInsemination}
            deleteAIAction={deleteArtificialInsemination}
            saveCalvingAction={saveCalving}
            savePDAction={savePregnancyCheck}
            saveDryAction={saveDryPeriod}
            addHealthAction={addHealthAction}
            updateHealthAction={updateHealthAction}
            deleteHealthAction={deleteHealthAction}
            addVaccineAction={addVaccineAction}
            updateVaccineAction={updateVaccineAction}
            deleteVaccineAction={deleteVaccineAction}
            addMassVaccineAction={addMassVaccineAction}
            updateGroupAction={updateAnimalGroup}
          />
        )}

        {tab === 'feeding' && (
          <FeedingClient 
            initialFeeds={await getFeeds(farmId)}
            initialRations={await getRations(farmId)}
            initialHistory={await getFeedingRecords(farmId)}
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
            targetFarmId={farmId}
          />
        )}

        {tab === 'milk' && (
          <MilkClient 
            animals={animals as any}
            initialRecords={await getMilkRecords(farmId)}
            addAction={addMilkRecord}
            deleteAction={deleteMilkRecord}
            updateAction={updateMilkRecord}
            targetFarmId={farmId}
          />
        )}

        {tab === 'finance' && (
          <FinanceClient 
            initialRecords={await getFinanceRecords(farmId)}
            staffList={await getStaff(farmId)}
            addAction={addFinanceRecord}
            deleteAction={deleteFinanceRecord}
            updateAction={updateFinanceRecord}
            targetFarmId={farmId}
          />
        )}


        {tab === 'staff' && (
          <StaffClient 
            initialStaff={await getStaff(farmId)}
            createAction={createStaff}
            deleteAction={deleteStaff}
            targetFarmId={farmId}
          />
        )}

        {tab === 'users' && (
          <TeamClient 
            initialTeam={await getTeamUsers(farmId)}
            targetFarmId={farmId}
          />
        )}

        {tab === 'health_all' && (
           <HealthClient 
             animals={animals}
            healthRecords={animals.flatMap((a: any) => (a.healthRecords || []).map((r: any) => ({ ...r, animal: a })))}
            vaccineRecords={animals.flatMap((a: any) => (a.vaccineRecords || []).map((r: any) => ({ ...r, animal: a })))}
            addHealthAction={addHealthAction}
            updateHealthAction={updateHealthAction}
            deleteHealthAction={deleteHealthAction}
            addVaccineAction={addVaccineAction}
            updateVaccineAction={updateVaccineAction}
            deleteVaccineAction={deleteVaccineAction}
            addMassVaccineAction={addMassVaccineAction}
            targetFarmId={farmId}
           />
        )}
      </main>
    </div>
  );
}
