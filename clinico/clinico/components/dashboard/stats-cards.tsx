"use client";

import { motion } from "framer-motion";
import { CalendarCheck2, Clock3, ClipboardList, SquareCheckBig } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalAppointments: number;
}

const cards = [
  { key: "todayAppointments", title: "Today's Appointments", icon: CalendarCheck2 },
  { key: "pendingAppointments", title: "Pending", icon: Clock3 },
  { key: "completedAppointments", title: "Completed", icon: SquareCheckBig },
  { key: "totalAppointments", title: "Total Appointments", icon: ClipboardList }
] as const;

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = props[card.key];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card className="border-primary/10 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <span className="rounded-lg bg-gradient-to-br from-primary/20 to-cyan-200/40 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{value}</div>
                <div className="mt-1 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary/70 to-cyan-400/70" />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
