"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";
import { appointmentDateTime, appointmentStatusBadge } from "@/lib/auth-role";
import type { Appointment } from "@/types";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAppointments(await api.appointments.getMine());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (id: number) => {
    setBusyId(id);
    try {
      await api.appointments.cancel(id);
      toast.success("Appointment cancelled");
      void load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to cancel appointment.");
    } finally {
      setBusyId(null);
    }
  };

  const canCancel = (a: Appointment) => a.status === "Booked" || a.status === "Confirmed" || a.status === "Delayed";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Appointments Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentCalendar appointments={appointments} perspective="dentist" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Dentist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No appointments yet.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(appointmentDateTime(appointment.appointmentDate, appointment.appointmentTime), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>{appointment.serviceName}</TableCell>
                    <TableCell>Dr. {appointment.dentistName}</TableCell>
                    <TableCell>
                      <Badge variant={appointmentStatusBadge(appointment.status)}>{appointment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canCancel(appointment) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={busyId === appointment.id}
                          onClick={() => cancel(appointment.id)}
                        >
                          <Ban className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
