"use client";

import { useCallback, useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScheduleFormDialog } from "@/components/schedules/schedule-form-dialog";
import { api, ApiError } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import { canCreateSchedule, canToggleAvailability } from "@/lib/auth-role";
import type { BackendRole, Schedule, UserSummary } from "@/types";

function formatScheduleDate(value: string) {
  const isoDate = value?.slice(0, 10);
  const fromIso = new Date(`${isoDate}T00:00:00`);
  if (!Number.isNaN(fromIso.getTime())) return format(fromIso, "MMM d, yyyy");

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "MMM d, yyyy");
}

export default function DoctorSchedulePage() {
  const [selectedDentistId, setSelectedDentistId] = useState<number | null>(null);
  const [role, setRole] = useState<BackendRole | null>(null);
  const [doctors, setDoctors] = useState<UserSummary[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [from, setFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setRole(session.role);
      if (session.role === "Doctor") setSelectedDentistId(session.userId);
    }

    api.users.getByRoleName("Doctor")
      .then((items) => {
        setDoctors(items);
        if (session?.role !== "Doctor") {
          setSelectedDentistId((current) => current ?? items[0]?.id ?? null);
        }
      })
      .catch(() => setDoctors([]));
  }, []);

  const load = useCallback(async () => {
    if (selectedDentistId === null) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setSchedules(await api.schedules.getByDentist(selectedDentistId, from, to));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  }, [selectedDentistId, from, to]);

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
            {role !== "Doctor" && (
              <div className="space-y-1">
                <Label htmlFor="dentist" className="text-xs text-muted-foreground">
                  Dentist
                </Label>
                <Select
                  value={selectedDentistId ? String(selectedDentistId) : ""}
                  onValueChange={(value) => setSelectedDentistId(Number(value))}
                >
                  <SelectTrigger id="dentist" className="w-[220px]">
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>
                        {doctor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
        {selectedDentistId !== null && canCreateSchedule(role) && (
          <ScheduleFormDialog dentistId={selectedDentistId} onCreated={load} />
        )}
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
                    <TableCell>{formatScheduleDate(schedule.date)}</TableCell>
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
