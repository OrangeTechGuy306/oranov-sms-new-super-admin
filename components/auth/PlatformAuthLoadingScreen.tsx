'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PlatformAuthLoadingScreenProps {
  message?: string;
}

export function PlatformAuthLoadingScreen({
  message = 'Verifying platform administrator session...',
}: PlatformAuthLoadingScreenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary" />
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            SMS Control Plane
          </p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
