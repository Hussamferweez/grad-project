"use client";

import { useCallback, useEffect, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScheduleFormDialog } from "@/components/schedules/schedule-form-dialog";
import { api, ApiError } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import { canCreateSchedule, canToggleAvailability } from "@/lib/auth-role";
import type { BackendRole, Schedule } from "@/types";

export default function DoctorSchedulePage() {
  const [dentistId, setDentistId] = useState<number | null>(null);
  const [role, setRole] = useState<BackendRole | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [from, setFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setDentistId(session.userId);
      setRole(session.role);
    }
  }, []);

  const load = useCallback(async () => {
    if (dentistId === null) return;
    setLoading(true);
    try {
      setSchedules(await api.schedules.getByDentist(dentistId, from, to));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  }, [dentistId, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleAvailability = async (schedule: Schedule) => {
    setBusyId(schedule.id);
    try {
      await api.schedules.updateAvailability(schedule.id, !schedule.isAvailable);
      toast.success("Availability updated");
      void load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to update availability.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Working Hours</CardTitle>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" />
            </div>
          </div>
        </div>
        {dentistId !== null && canCreateSchedule(role) && <ScheduleFormDialog dentistId={dentistId} onCreated={load} />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No schedule slots in this range.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{format(parseISO(schedule.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{schedule.dayOfWeek}</TableCell>
                    <TableCell>{schedule.startTime}</TableCell>
                    <TableCell>{schedule.endTime}</TableCell>
                    <TableCell>
                      <Badge variant={schedule.isAvailable ? "success" : "secondary"}>
                        {schedule.isAvailable ? "Open" : "Blocked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canToggleAvailability(role) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === schedule.id}
                          onClick={() => toggleAvailability(schedule)}
                        >
                          {schedule.isAvailable ? "Block" : "Open"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
  );
}
