"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="card-lift border-primary/15 shadow-xl shadow-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Welcome back to Clinico.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </motion.div>
  );
}
