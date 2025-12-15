import { Skeleton } from "@/components/ui/Skeleton";

export const DocumentSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Title Skeleton */}
      <Skeleton className="h-14 w-[50%] mb-8" />
      
      {/* Toolbar Skeleton */}
      <div className="flex gap-4 mb-8">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
      </div>

      {/* More Content Skeleton */}
      <div className="space-y-4 mt-8">
        <Skeleton className="h-8 w-[30%] mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[98%]" />
      </div>
    </div>
  );
};
