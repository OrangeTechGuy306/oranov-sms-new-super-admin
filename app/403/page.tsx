'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldOff, ArrowLeft, LogIn } from 'lucide-react';
import { PlatformAuthCard } from '@/components/auth/PlatformAuthCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const reason =
    searchParams.get('reason') ||
    'Access to this Super Admin Console resource requires an authorized active platform administrator account.';
  const { isAuthenticated, user, logout } = usePlatformAuth();

  return (
    <PlatformAuthCard
      title="Access Denied (403)"
      description="Your current account status or identity boundary does not permit platform console access."
      badgeText="Authorization Blocked"
    >
      <div className="space-y-4">
        <AlertBanner variant="error" title="Restricted Platform Resource">
          <div className="flex items-start gap-2">
            <ShieldOff className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        </AlertBanner>

        {isAuthenticated && user && (
          <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs space-y-1">
            <p className="text-muted-foreground">
              Signed in as <strong className="text-foreground">{user.name}</strong> (
              <span className="font-mono">{user.email}</span>)
            </p>
            <p className="text-muted-foreground">
              Assigned role: <span className="font-mono">{user.role}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {isAuthenticated ? (
            <>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Overview
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In as Platform Administrator
            </Link>
          )}
        </div>
      </div>
    </PlatformAuthCard>
  );
}

export default function Platform403Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading access status...
        </div>
      }
    >
      <AccessDeniedContent />
    </Suspense>
  );
}
