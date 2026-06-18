"use client";

import { useState } from "react";
import { Loader2, Timer } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MarkDelayDialogProps {
  appointment: Appointment;
  onUpdated?: () => void;
}

export function MarkDelayDialog({ appointment, onUpdated }: MarkDelayDialogProps) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(15);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!reason.trim()) {
      toast.error("A reason is required.");
      return;
    }
    setSaving(true);
    try {
      await api.delays.mark({ appointmentId: appointment.id, delayDurationMinutes: minutes, reason });
      toast.success("Delay recorded — the patient will be notified.");
      setOpen(false);
      setReason("");
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to record delay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Timer className="mr-1 h-4 w-4" />
          Delay
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Delay</DialogTitle>
          <DialogDescription>
            {appointment.patientName} — {appointment.appointmentDate} {appointment.appointmentTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delayMinutes">Delay (minutes)</Label>
            <Input
              id="delayMinutes"
              type="number"
              min={1}
              max={480}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delayReason">Reason</Label>
            <Textarea id="delayReason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <Button onClick={onSubmit} className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Delay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
