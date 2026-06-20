import { ReactNode } from "react";
import { SmilePlus } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-100/20 blur-3xl" />
        <div className="inline-flex items-center gap-2 text-2xl font-semibold">
          <SmilePlus className="h-7 w-7" />
          Clinico
        </div>
        <div className="max-w-md">
          <h1 className="mb-4 text-4xl font-bold leading-tight">Clinic Desk and Doctor Workspace</h1>
          <p className="text-white/85">
            Manage appointments, schedules, delay notices, services, and clinic records from one staff dashboard.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/30 bg-white/10 p-3">Live schedules</div>
            <div className="rounded-xl border border-white/30 bg-white/10 p-3">Reception booking</div>
            <div className="rounded-xl border border-white/30 bg-white/10 p-3">Doctor updates</div>
            <div className="rounded-xl border border-white/30 bg-white/10 p-3">Role dashboards</div>
          </div>
        </div>
        <p className="text-sm text-white/80">Built for receptionists and doctors to run the clinic day smoothly.</p>
      </div>
      <div className="flex items-center justify-center p-4 sm:p-10">{children}</div>
    </main>
  );
}
