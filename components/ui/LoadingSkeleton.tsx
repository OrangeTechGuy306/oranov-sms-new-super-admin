import React from 'react';
import { cn } from '@/lib/utils/cn';

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-muted rounded-md', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-card p-5 rounded-xl border border-border space-y-3">
      <LoadingSkeleton className="h-4 w-1/3" />
      <LoadingSkeleton className="h-8 w-1/2" />
      <LoadingSkeleton className="h-3 w-3/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <LoadingSkeleton key={`h_${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r_${r}`} className="flex gap-4 py-2 border-b border-border/40">
          {Array.from({ length: cols }).map((_, c) => (
            <LoadingSkeleton key={`c_${c}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
