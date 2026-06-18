"use client";

import { useState } from "react";
import { Loader2, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditAppointmentDialogProps {
  appointment: Appointment;
  onUpdated?: () => void;
}

/** Reschedule dialog — calls the manage endpoint with action "reschedule". */
export function EditAppointmentDialog({ appointment, onUpdated }: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(appointment.appointmentDate);
  const [time, setTime] = useState(appointment.appointmentTime);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!date || !time) {
      toast.error("Pick a new date and time.");
      return;
    }
    setSaving(true);
    try {
      await api.appointments.manage(appointment.id, { action: "reschedule", newDate: date, newTime: time });
      toast.success("Appointment rescheduled");
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to reschedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <CalendarClock className="mr-1 h-4 w-4" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            {appointment.patientName} — {appointment.serviceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newDate">New Date</Label>
              <Input id="newDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTime">New Time</Label>
              <Input id="newTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <Button onClick={onSubmit} className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
