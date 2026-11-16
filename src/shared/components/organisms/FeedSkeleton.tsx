import { Skeleton } from "@/shared/components/atoms/Skeleton";

export function FeedSkeleton() {
  return (
    <div role="status" aria-label="Carregando editais" className="flex flex-col">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 border-b border-line p-5">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}
