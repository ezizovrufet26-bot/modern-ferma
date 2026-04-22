import { getStaff, deleteStaff, createStaff } from "@/app/actions/staff";
import StaffClient from "@/components/StaffClient";

export default async function StaffPage() {
  const staffMembers = await getStaff();

  return (
    <div className="bg-gray-50 min-h-screen">
      <StaffClient 
        initialStaff={staffMembers}
        createAction={createStaff}
        deleteAction={deleteStaff}
      />
    </div>
  );
}

