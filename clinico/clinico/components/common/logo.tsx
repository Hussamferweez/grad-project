import Link from "next/link";
import { SmilePlus } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-semibold text-primary">
      <span className="rounded-lg bg-primary/10 p-2 text-primary">
        <SmilePlus className="h-5 w-5" />
      </span>
      <span className="text-xl tracking-tight">Clinico</span>
    </Link>
  );
}
