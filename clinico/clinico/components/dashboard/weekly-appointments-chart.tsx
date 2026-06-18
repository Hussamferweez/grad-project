"use client";

import { format, parseISO } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyAppointmentsChartProps {
  appointments: Array<{ appointmentDate: string }>;
}

export function WeeklyAppointmentsChart({ appointments }: WeeklyAppointmentsChartProps) {
  const grouped = appointments.reduce<Record<string, number>>((acc, item) => {
    const day = format(parseISO(item.appointmentDate), "EEE");
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = allDays.map((day) => ({
    day,
    appointments: grouped[day] ?? 0
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weekly Appointments</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="appointments" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
