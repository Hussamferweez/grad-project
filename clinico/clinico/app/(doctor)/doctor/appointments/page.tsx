"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { api, ApiError } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import { canBookAppointment } from "@/lib/auth-role";
import type { Appointment, BackendRole, Service } from "@/types";

export default function StaffAppointmentsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<BackendRole | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setUserId(session.userId);
      setRole(session.role);
    }
    api.services
      .getAll()
      .then(setServices)
      .catch(() => {
        /* services are optional for viewing */
      });
  }, []);

  const loadAppointments = useCallback(async () => {
    if (role === null || userId === null) return;
    setLoading(true);
    try {
      // Doctors see their own day; front-desk roles see all appointments on the date.
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

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Appointments</CardTitle>
          <div className="mt-3 flex items-center gap-2">
            <Label htmlFor="filterDate" className="text-sm text-muted-foreground">
              Date
            </Label>
            <Input
              id="filterDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        {canBookAppointment(role) && <AppointmentFormDialog services={services} onCreated={loadAppointments} />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <AppointmentsTable appointments={appointments} role={role} onChanged={loadAppointments} />
        )}
      </CardContent>
    </Card>
  );
}
