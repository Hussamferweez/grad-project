"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
      <Card className="card-lift border-primary/15 shadow-xl shadow-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create your account</CardTitle>
          <CardDescription className="text-center">Create a patient account to view your appointments and medical records.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </motion.div>
  );
}
