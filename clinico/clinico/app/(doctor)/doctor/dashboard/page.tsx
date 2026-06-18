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
      <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-cyan-100/40 to-emerald-100/40 p-5">
        <h2 className="text-lg font-semibold">Today at a Glance</h2>
        <p className="text-sm text-muted-foreground">A quick snapshot of your appointments and patient load.</p>
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
                <div key={appointment.id} className="rounded-lg border p-3">
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
