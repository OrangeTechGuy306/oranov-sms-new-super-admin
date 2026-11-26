'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import type { PlatformRouteDenialReason } from '@/lib/iam/rbac';

export interface PlatformAccessDeniedStateProps {
  title?: string;
  description?: string;
  requiredPermission?: string;
  reason?: PlatformRouteDenialReason;
  roleName?: string;
  homeHref?: string;
}

export function PlatformAccessDeniedState({
  title = 'Control Plane Access Denied (403)',
  description,
  requiredPermission,
  reason = 'INSUFFICIENT_PERMISSION',
  roleName,
  homeHref = '/',
}: PlatformAccessDeniedStateProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(homeHref);
  };

  return (
    <div
      role="alert"
      data-testid="platform-access-denied"
      data-denial-reason={reason}
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-500/10 text-rose-600 dark:border-rose-900/40 dark:text-rose-400">
        <ShieldAlert className="size-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>

      <p className="mt-1.5 mb-3 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description ||
          `Your active platform role${roleName ? ` (${roleName})` : ''} lacks authorization for this control-plane route.`}
      </p>

      {requiredPermission && (
        <div className="mb-6 rounded-md border border-border bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground">
          Required Permission: {requiredPermission}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          <Home className="size-3.5" />
          Platform Home
        </Link>
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          Go Back
        </button>
      </div>
    </div>
  );
}
