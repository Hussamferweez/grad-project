import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-[360px] rounded-xl" />
    </div>
  );
}
