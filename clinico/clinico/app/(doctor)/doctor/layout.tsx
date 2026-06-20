import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Topbar } from "@/components/common/topbar";
import { getServerSession } from "@/lib/session.server";
import { isStaffRole } from "@/lib/auth-role";

export default async function DoctorLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) redirect("/login");
  if (!isStaffRole(session.role)) redirect("/patient/dashboard");

  return (
    <div className="min-h-screen bg-muted/25 lg:grid lg:grid-cols-[auto_1fr]">
      <AppSidebar portal="doctor" role={session.role} />
      <div className="min-w-0">
        <Topbar portal="doctor" role={session.role} userFullName={session.fullName} />
        <main className="mx-auto w-full max-w-[1500px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
