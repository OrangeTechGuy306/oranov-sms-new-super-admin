'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { isPlatformMockAuthEnabled } from '@/lib/auth/platformAuthConfig';
import { getSafePlatformReturnUrl } from '@/lib/auth/urlSecurity';

interface PlatformSessionExpiredModalProps {
  open: boolean;
}

export function PlatformSessionExpiredModal({
  open,
}: PlatformSessionExpiredModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    expiredEmail,
    initiateLogin,
    logout,
    isLoading,
    dismissSessionExpired,
  } = usePlatformAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetEmail = expiredEmail || user?.email || '';

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) {
      await handleSignInAnotherAccount();
      return;
    }

    setError(null);
    const res = await initiateLogin({
      email: targetEmail,
      password,
      rememberMe: true,
    });
    setPassword('');

    if (res.success) {
      return;
    }

    if (res.requires2fa) {
      const safeReturn = getSafePlatformReturnUrl(pathname, '/');
      router.push(`/2fa?returnUrl=${encodeURIComponent(safeReturn)}`);
      return;
    }

    setError(res.error || 'Failed to verify credentials.');
  };

  const handleSignInAnotherAccount = async () => {
    dismissSessionExpired();
    await logout();
    const safeReturn = getSafePlatformReturnUrl(pathname, '/');
    router.replace(
      `/login?returnUrl=${encodeURIComponent(safeReturn)}&reason=expired`
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {}}
      title={
        <span className="flex items-center gap-2 text-base">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Platform Session Expired
        </span>
      }
      description="Your simulated Super Admin console session has expired. Re-authenticate to continue."
      size="md"
    >
      <div className="space-y-4">
        <AlertBanner variant="warning" title="Re-Authentication Required">
          {targetEmail ? (
            <>
              Session timed out for <strong>{targetEmail}</strong>.{' '}
            </>
          ) : (
            <>Your administrator session timed out. </>
          )}
          {isPlatformMockAuthEnabled() &&
            'In development simulation mode, enter your platform demo password to resume.'}
        </AlertBanner>

        {error && (
          <AlertBanner variant="error" title="Authentication Failed">
            {error}
          </AlertBanner>
        )}

        <form onSubmit={handleReauth} className="space-y-4">
          {targetEmail && (
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={targetEmail}
              readOnly
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="platform-reauth-password"
              className="text-xs font-medium text-foreground block"
            >
              Platform Administrator Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                id="platform-reauth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                required
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading || !password}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Verifying...' : 'Resume Session'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSignInAnotherAccount}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-border bg-card text-foreground text-xs font-medium hover:bg-muted cursor-pointer"
            >
              Sign In to Another Account
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
