import { getTeamUsers } from "@/app/actions/team";
import TeamClient from "@/components/TeamClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'FARM_ADMIN') {
    redirect('/');
  }

  const team = await getTeamUsers();

  return (
    <div className="bg-gray-50 min-h-screen">
      <TeamClient initialTeam={team} />
    </div>
  );
}
