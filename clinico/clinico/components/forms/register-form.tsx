"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, RegisterSchema } from "@/lib/validations";
import { api, ApiError } from "@/lib/api";
import { homeForRole, sessionFromAuth, setClientSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      dateOfBirth: "",
      address: ""
    }
  });

  const onSubmit = async (values: RegisterSchema) => {
    try {
      const auth = await api.auth.register({
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth : null,
        address: values.address ? values.address : null
      });

      setClientSession(sessionFromAuth(auth));
      toast.success("Account created successfully");
      router.push(homeForRole(auth.role));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to create account. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register("username")} />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input id="phoneNumber" placeholder="+201000000000" {...register("phoneNumber")} />
        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth (optional)</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address (optional)</Label>
          <Input id="address" {...register("address")} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
