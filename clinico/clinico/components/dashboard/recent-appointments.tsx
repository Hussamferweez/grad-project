import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { appointmentDateTime, appointmentStatusBadge } from "@/lib/auth-role";
import type { Appointment } from "@/types";

interface RecentAppointmentsProps {
  appointments: Appointment[];
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No appointments yet.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.patientName}</TableCell>
                  <TableCell>{appointment.serviceName}</TableCell>
                  <TableCell>
                    {format(appointmentDateTime(appointment.appointmentDate, appointment.appointmentTime), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={appointmentStatusBadge(appointment.status)}>{appointment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
