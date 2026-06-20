"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarCheck2, Clock3, Search, SquareCheckBig, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { appointmentStatusBadge, canBookAppointment } from "@/lib/auth-role";
import { getClientSession } from "@/lib/session";
import type { Appointment, AppointmentStatus, BackendRole, Service } from "@/types";

const statusFilters: Array<"All" | AppointmentStatus> = ["All", "Booked", "Confirmed", "Delayed", "Completed", "Cancelled"];

export default function StaffAppointmentsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<BackendRole | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | AppointmentStatus>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setUserId(session.userId);
      setRole(session.role);
    }
    api.services.getAll().then(setServices).catch(() => {
      /* services are optional for viewing */
    });
  }, []);

  const loadAppointments = useCallback(async () => {
    if (role === null || userId === null) return;
    setLoading(true);
    try {
      const data =
        role === "Doctor"
          ? await api.appointments.getByDentist(userId, date)
          : await api.appointments.getByDate(date);
      setAppointments(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [role, userId, date]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus = status === "All" || appointment.status === status;
    const text = `${appointment.patientName} ${appointment.dentistName} ${appointment.serviceName}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const bookedCount = appointments.filter((a) => a.status === "Booked").length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const delayedCount = appointments.filter((a) => a.status === "Delayed").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  const summary = [
    { label: "Booked", value: bookedCount, icon: CalendarCheck2, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200" },
    { label: "Confirmed", value: confirmedCount, icon: Clock3, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
    { label: "Delayed", value: delayedCount, icon: TimerReset, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" },
    { label: "Completed", value: completedCount, icon: SquareCheckBig, tone: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200" }
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                </div>
                <span className={`rounded-xl p-2 ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Appointments</CardTitle>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Label htmlFor="filterDate" className="text-sm text-muted-foreground">
                  Date
                </Label>
                <Input id="filterDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
              </div>
            </div>
            {canBookAppointment(role) && <AppointmentFormDialog services={services} onCreated={loadAppointments} />}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patient, dentist, or service"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={status === item ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(item)}
                  className="h-9"
                >
                  {item !== "All" && <Badge variant={appointmentStatusBadge(item)} className="mr-2 h-2 w-2 rounded-full p-0" />}
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : (
            <AppointmentsTable appointments={filteredAppointments} role={role} onChanged={loadAppointments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
