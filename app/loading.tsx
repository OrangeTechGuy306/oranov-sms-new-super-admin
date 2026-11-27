import { CardSkeleton, LoadingSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <LoadingSkeleton className="h-7 w-56" />
          <LoadingSkeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <LoadingSkeleton className="h-9 w-28" />
          <LoadingSkeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
