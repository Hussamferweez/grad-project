import { ReactNode } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ClipboardList, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "@/lib/session.server";
import { api, ApiError } from "@/lib/api";
import { appointmentDateTime, appointmentStatusBadge } from "@/lib/auth-role";
import type { Appointment } from "@/types";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  let appointments: Appointment[] = [];
  let loadError: string | null = null;
  try {
    appointments = await api.appointments.getMine(session.token);
  } catch (err) {
    loadError = err instanceof ApiError ? err.errors[0] : "Unable to load appointments.";
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = appointments
    .filter((a) => (a.status === "Booked" || a.status === "Confirmed") && a.appointmentDate >= today)
    .sort((a, b) => `${a.appointmentDate}T${a.appointmentTime}`.localeCompare(`${b.appointmentDate}T${b.appointmentTime}`));

  const completed = appointments.filter((a) => a.status === "Completed").length;
  const progress = appointments.length ? Math.round((completed / appointments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-cyan-100/45 to-teal-100/50 p-5">
        <h2 className="text-lg font-semibold">Patient Overview</h2>
        <p className="text-sm text-muted-foreground">Track your next visits and treatment progress.</p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{loadError}</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Upcoming Appointments" value={String(upcoming.length)} icon={<CalendarDays className="h-4 w-4" />} />
        <MetricCard title="Treatment Progress" value={`${progress}%`} icon={<ClipboardList className="h-4 w-4" />} />
        <MetricCard title="Total Appointments" value={String(appointments.length)} icon={<FileText className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Visits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length ? (
            upcoming.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{appointment.serviceName}</p>
                  <p className="text-sm text-muted-foreground">Dr. {appointment.dentistName}</p>
                </div>
                <div className="text-right">
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/patient/appointments">View Appointments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/patient/medical-records">Open Medical Record</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/patient/profile">Profile Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card className="card-lift">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className="rounded-lg bg-gradient-to-br from-primary/20 to-cyan-200/45 p-2 text-primary">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
