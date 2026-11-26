'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlatformAuthCard } from '@/components/auth/PlatformAuthCard';
import { PlatformTwoFactorForm } from '@/components/auth/PlatformTwoFactorForm';
import { getSafePlatformReturnUrl } from '@/lib/auth/urlSecurity';

function TwoFactorContent() {
  const searchParams = useSearchParams();
  const returnUrl = getSafePlatformReturnUrl(searchParams.get('returnUrl'), '/');

  return (
    <PlatformAuthCard
      title="Two-Factor Authentication"
      description="Complete simulated multi-factor challenge to establish your Super Admin console session."
      badgeText="2FA Verification"
    >
      <PlatformTwoFactorForm returnUrl={returnUrl} />
    </PlatformAuthCard>
  );
}

export default function PlatformTwoFactorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading 2FA verification challenge...
        </div>
      }
    >
      <TwoFactorContent />
    </Suspense>
  );
}
