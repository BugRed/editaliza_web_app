import { Skeleton } from "@/shared/components/atoms/Skeleton";

export function FeedSkeleton() {
  return (
    <div role="status" aria-label="Carregando editais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-40" />
      ))}
    </div>
  );
}
