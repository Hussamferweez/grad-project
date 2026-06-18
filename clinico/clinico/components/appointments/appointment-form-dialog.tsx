"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { bookAppointmentSchema, BookAppointmentSchema } from "@/lib/validations";
import { api, ApiError } from "@/lib/api";
import { getClientSession } from "@/lib/session";
import type { Service, UserSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppointmentFormDialogProps {
  services: Service[];
  onCreated?: () => void;
}

export function AppointmentFormDialog({ services, onCreated }: AppointmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<UserSummary[]>([]);
  const [dentists, setDentists] = useState<UserSummary[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<BookAppointmentSchema>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: { patientId: undefined, dentistId: undefined, serviceId: undefined, date: "", time: "" }
  });

  // Load pickers; if the API rejects (e.g. permissions), fall back to manual ID entry.
  useEffect(() => {
    api.users.getByRoleName("Patient").then(setPatients).catch(() => setPatients([]));
    api.users.getByRoleName("Doctor").then(setDentists).catch(() => setDentists([]));
  }, []);

  const onSubmit = async (data: BookAppointmentSchema) => {
    const session = getClientSession();
    if (!session) {
      toast.error("Your session expired. Please sign in again.");
      return;
    }

    try {
      await api.appointments.book({
        patientId: data.patientId,
        dentistId: data.dentistId,
        serviceId: data.serviceId,
        appointmentDate: data.date,
        appointmentTime: data.time,
        createdBy: session.userId,
        scheduleId: data.scheduleId ?? null
      });
      toast.success("Appointment booked successfully");
      reset({ patientId: undefined, dentistId: undefined, serviceId: undefined, date: "", time: "" });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to book appointment.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>Book on behalf of a patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient</Label>
              {patients.length > 0 ? (
                <Controller
                  control={control}
                  name="patientId"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.fullName} (#{p.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Input id="patientId" type="number" min={1} placeholder="Patient ID" {...register("patientId")} />
              )}
              {errors.patientId && <p className="text-sm text-destructive">{errors.patientId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dentistId">Dentist</Label>
              {dentists.length > 0 ? (
                <Controller
                  control={control}
                  name="dentistId"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dentist" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentists.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.fullName} (#{d.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Input id="dentistId" type="number" min={1} placeholder="Dentist ID" {...register("dentistId")} />
              )}
              {errors.dentistId && <p className="text-sm text-destructive">{errors.dentistId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service</Label>
            <Controller
              control={control}
              name="serviceId"
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={String(service.id)}>
                        {service.name} ({service.approximateDurationMinutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.serviceId && <p className="text-sm text-destructive">{errors.serviceId.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Appointment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
