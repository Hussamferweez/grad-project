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
    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-slate-400 hover:bg-white/10 hover:text-white">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
