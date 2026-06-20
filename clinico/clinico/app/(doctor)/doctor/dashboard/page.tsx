import { redirect } from "next/navigation";
import { endOfWeek, format, isWithinInterval, startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeeklyAppointmentsChart } from "@/components/dashboard/weekly-appointments-chart";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { getServerSession } from "@/lib/session.server";
import { api, ApiError } from "@/lib/api";
import { appointmentDateTime, appointmentStatusBadge } from "@/lib/auth-role";
import type { Appointment } from "@/types";

export default async function DoctorDashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");

  let appointments: Appointment[] = [];
  let loadError: string | null = null;
  try {
    // Doctors see their own appointments; front-desk roles see today's clinic snapshot.
    appointments =
      session.role === "Doctor"
        ? await api.appointments.getByDentist(session.userId, undefined, session.token)
        : await api.appointments.getByDate(today, session.token);
  } catch (err) {
    loadError = err instanceof ApiError ? err.errors[0] : "Unable to load appointments.";
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const todayAppointments = appointments.filter((a) => a.appointmentDate === today).length;
  const pendingAppointments = appointments.filter((a) => a.status === "Booked" || a.status === "Confirmed").length;
  const completedAppointments = appointments.filter((a) => a.status === "Completed").length;

  const weekAppointments = appointments.filter((a) =>
    isWithinInterval(new Date(`${a.appointmentDate}T00:00:00`), { start: weekStart, end: weekEnd })
  );

  const upcoming = appointments
    .filter((a) => (a.status === "Booked" || a.status === "Confirmed") && a.appointmentDate >= today)
    .sort((a, b) => `${a.appointmentDate}T${a.appointmentTime}`.localeCompare(`${b.appointmentDate}T${b.appointmentTime}`))
    .slice(0, 5);

  const recent = [...appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-white/70 bg-slate-950 text-white shadow-[0_24px_70px_-45px_hsl(218_50%_18%)] dark:border-white/10">
        <div className="grid gap-5 p-5 md:grid-cols-[1.5fr_1fr] md:p-6">
          <div>
            <Badge className="mb-3 rounded-md bg-primary/20 text-cyan-100 hover:bg-primary/20">
              {session.role} workspace
            </Badge>
            <h2 className="text-2xl font-semibold">Today at a Glance</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">A focused view of appointments, workload, and patient movement.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Today</p>
              <p className="mt-1 text-2xl font-semibold">{todayAppointments}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Pending</p>
              <p className="mt-1 text-2xl font-semibold">{pendingAppointments}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Done</p>
              <p className="mt-1 text-2xl font-semibold">{completedAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <StatsCards
        todayAppointments={todayAppointments}
        pendingAppointments={pendingAppointments}
        completedAppointments={completedAppointments}
        totalAppointments={appointments.length}
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <WeeklyAppointmentsChart appointments={weekAppointments} />
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length ? (
              upcoming.map((appointment) => (
                <div key={appointment.id} className="rounded-lg border bg-white/60 p-3 shadow-sm dark:bg-white/5">
                  <p className="font-medium">{appointment.patientName}</p>
                  <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm">
                      {format(appointmentDateTime(appointment.appointmentDate, appointment.appointmentTime), "MMM d, h:mm a")}
                    </p>
                    <Badge variant={appointmentStatusBadge(appointment.status)}>{appointment.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <RecentAppointments appointments={recent} />
    </div>
  );
}
