"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordSchema,
  ChangePasswordSchema,
  profileSchema,
  ProfileSchema
} from "@/lib/validations";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettings() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "", address: "", emergencyContact: "" }
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  useEffect(() => {
    api.users
      .getProfile()
      .then((profile) => {
        setEmail(profile.email);
        profileForm.reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          address: profile.address ?? "",
          emergencyContact: profile.emergencyContact ?? ""
        });
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.errors[0] : "Unable to load profile."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (values: ProfileSchema) => {
    try {
      await api.users.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        address: values.address ? values.address : null,
        emergencyContact: values.emergencyContact ? values.emergencyContact : null
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to update profile.");
    }
  };

  const onChangePassword = async (values: ChangePasswordSchema) => {
    try {
      await api.users.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      toast.success("Password changed");
      passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.errors[0] : "Unable to change password.");
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...profileForm.register("firstName")} />
                {profileForm.formState.errors.firstName && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...profileForm.register("lastName")} />
                {profileForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input id="phoneNumber" {...profileForm.register("phoneNumber")} />
              {profileForm.formState.errors.phoneNumber && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...profileForm.register("address")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" {...profileForm.register("emergencyContact")} />
            </div>

            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
