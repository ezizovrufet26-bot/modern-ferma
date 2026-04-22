import { getFinanceRecords, addFinanceRecord, deleteFinanceRecord, updateFinanceRecord } from "@/app/actions/finance";
import { getStaff } from "@/app/actions/staff";
import FinanceClient from "@/components/FinanceClient";

export default async function FinancePage() {
  const records = await getFinanceRecords();
  const staff = await getStaff();

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <FinanceClient 
        initialRecords={records}
        staffList={staff}
        addAction={addFinanceRecord}
        deleteAction={deleteFinanceRecord}
        updateAction={updateFinanceRecord}
      />
    </div>
  );
}

