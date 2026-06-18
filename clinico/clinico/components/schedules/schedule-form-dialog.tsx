"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createScheduleSchema, CreateScheduleSchema } from "@/lib/validations";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleFormDialogProps {
  dentistId: number;
  onCreated?: () => void;
}

export function ScheduleFormDialog({ dentistId, onCreated }: ScheduleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateScheduleSchema>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: { date: "", startTime: "09:00", endTime: "17:00", isAvailable: true }
  });

  const onSubmit = async (data: CreateScheduleSchema) => {
    try {
      await api.schedules.create({
        dentistId,
        // The backend stores the weekday name; derive it from the chosen date.
        dayOfWeek: format(parseISO(data.date), "EEEE"),
        startTime: data.startTime,
        endTime: data.endTime,
        date: data.date,
        isAvailable: data.isAvailable
      });
      toast.success("Schedule slot created");
      reset({ date: "", startTime: "09:00", endTime: "17:00", isAvailable: true });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to create schedule.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Working Hours</DialogTitle>
          <DialogDescription>Publish a working slot for a specific date.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
              {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
              {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Open for booking</SelectItem>
                    <SelectItem value="false">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Slot"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
