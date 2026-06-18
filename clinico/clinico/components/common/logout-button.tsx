"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearClientSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant="ghost" onClick={handleSignOut} className="justify-start">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
