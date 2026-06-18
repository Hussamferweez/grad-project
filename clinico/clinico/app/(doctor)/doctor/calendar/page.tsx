"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { api, ApiError } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import type { Appointment } from "@/types";

export default function DoctorCalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Doctors see their own appointments; front-desk roles see today's clinic snapshot.
    const request =
      session.role === "Doctor"
        ? api.appointments.getByDentist(session.userId)
        : api.appointments.getByDate(new Date().toISOString().slice(0, 10));

    request
      .then(setAppointments)
      .catch((err) => toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load calendar."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar View</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <AppointmentCalendar appointments={appointments} />
        )}
      </CardContent>
    </Card>
  );
}
