import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Topbar } from "@/components/common/topbar";
import { getServerSession } from "@/lib/session.server";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) redirect("/login");
  if (session.role !== "Patient") redirect("/");

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[auto_1fr]">
      <AppSidebar portal="patient" role={session.role} />
      <div className="min-w-0">
        <Topbar portal="patient" role={session.role} userFullName={session.fullName} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
