"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, LoginSchema } from "@/lib/validations";
import { api, ApiError } from "@/lib/api";
import { homeForRole, sessionFromAuth, setClientSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" }
  });

  const onSubmit = async (values: LoginSchema) => {
    try {
      const auth = await api.auth.login(values);
      setClientSession(sessionFromAuth(auth));

      if (auth.role !== "Doctor" && auth.role !== "Patient") {
        toast.info(`Signed in as ${auth.role}. No dedicated portal is available for this role.`);
      } else {
        toast.success(`Welcome back, ${auth.fullName.split(" ")[0]}!`);
      }

      router.push(homeForRole(auth.role));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to sign in. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="identifier">Email or Phone</Label>
        <Input id="identifier" autoComplete="username" placeholder="you@clinico.com or +20100..." {...register("identifier")} />
        {errors.identifier && <p className="text-sm text-destructive">{errors.identifier.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
