"use client";

import { useState } from "react";
import { CheckCircle2, MoreHorizontal, Ban, CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, type ManageAction } from "@/lib/api";
import {
  appointmentStatusBadge,
  canCancelAppointment,
  canManageAppointment,
  canMarkDelay
} from "@/lib/auth-role";
import type { Appointment, BackendRole } from "@/types";
import { EditAppointmentDialog } from "@/components/appointments/edit-appointment-dialog";
import { MarkDelayDialog } from "@/components/appointments/mark-delay-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AppointmentsTableProps {
  appointments: Appointment[];
  role: BackendRole | null;
  onChanged?: () => void;
}

export function AppointmentsTable({ appointments, role, onChanged }: AppointmentsTableProps) {
  const [busyId, setBusyId] = useState<number | null>(null);

  const canManage = canManageAppointment(role); // confirm / reschedule / complete
  const canDelay = canMarkDelay(role);
  const canCancel = canCancelAppointment(role);

  const runManage = async (id: number, action: ManageAction) => {
    setBusyId(id);
    try {
      await api.appointments.manage(id, { action });
      toast.success(`Appointment ${action}d`);
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : `Unable to ${action} appointment.`);
    } finally {
      setBusyId(null);
    }
  };

  const cancelAppointment = async (id: number) => {
    setBusyId(id);
    try {
      await api.appointments.cancel(id);
      toast.success("Appointment cancelled");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to cancel appointment.");
    } finally {
      setBusyId(null);
    }
  };

  const isClosed = (a: Appointment) => a.status === "Completed" || a.status === "Cancelled";
  const hasMenu = canManage || canCancel;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Dentist</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[220px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
              No appointments found.
            </TableCell>
          </TableRow>
        ) : (
          appointments.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.patientName}</TableCell>
              <TableCell>{item.dentistName}</TableCell>
              <TableCell>
                <div>{item.serviceName}</div>
                <div className="text-xs text-muted-foreground">{item.durationMinutes} min</div>
              </TableCell>
              <TableCell>{item.appointmentDate}</TableCell>
              <TableCell>{item.appointmentTime}</TableCell>
              <TableCell>
                <Badge variant={appointmentStatusBadge(item.status)}>{item.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {!isClosed(item) && (
                    <>
                      {canManage && <EditAppointmentDialog appointment={item} onUpdated={onChanged} />}
                      {canDelay && <MarkDelayDialog appointment={item} onUpdated={onChanged} />}
                      {hasMenu && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={busyId === item.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canManage && item.status === "Booked" && (
                              <DropdownMenuItem onClick={() => runManage(item.id, "confirm")}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {canManage && (
                              <DropdownMenuItem onClick={() => runManage(item.id, "complete")}>
                                <CircleCheckBig className="mr-2 h-4 w-4" />
                                Complete
                              </DropdownMenuItem>
                            )}
                            {canCancel && (
                              <DropdownMenuItem className="text-destructive" onClick={() => cancelAppointment(item.id)}>
                                <Ban className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
