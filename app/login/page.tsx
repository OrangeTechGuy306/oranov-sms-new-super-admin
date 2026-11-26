'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { PlatformAuthCard } from '@/components/auth/PlatformAuthCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import {
  isPlatformDevControlsEnabled,
  isPlatformMockAuthEnabled,
} from '@/lib/auth/platformAuthConfig';
import { getPlatformDemoAccounts } from '@/lib/auth/platformDemoAccounts';
import { getSafePlatformReturnUrl } from '@/lib/auth/urlSecurity';

function PlatformLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafePlatformReturnUrl(searchParams.get('returnUrl'), '/');
  const reason = searchParams.get('reason');

  const { initiateLogin, isAuthenticated, isLoading } = usePlatformAuth();

  const mockEnabled =
    process.env.NODE_ENV !== 'production' && isPlatformMockAuthEnabled();
  const devControlsEnabled =
    process.env.NODE_ENV !== 'production' && isPlatformDevControlsEnabled();
  const demoAccounts = devControlsEnabled ? getPlatformDemoAccounts() : [];

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Enter a valid platform administrator email address.');
      emailRef.current?.focus();
      return;
    }

    if (!password) {
      setErrorMessage('Enter your administrator password.');
      passwordRef.current?.focus();
      return;
    }

    const res = await initiateLogin({
      email: trimmedEmail,
      password,
      rememberMe,
    });

    setPassword('');

    if (res.success) {
      router.replace(returnUrl);
      return;
    }

    if (res.requires2fa) {
      router.push(`/2fa?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (res.denied) {
      router.replace(
        `/403?reason=${encodeURIComponent(res.error || 'Account restricted')}`
      );
      return;
    }

    setErrorMessage(res.error);
  };

  const handleFillDemoAccount = (demoEmail: string, demoSecret: string) => {
    if (process.env.NODE_ENV === 'production' || !devControlsEnabled) return;
    setEmail(demoEmail);
    setPassword(demoSecret);
    setErrorMessage(null);
  };

  return (
    <PlatformAuthCard
      title="Platform Administrator Sign In"
      description="Authenticate to access the Super Admin SaaS governance, billing, and tenant operations console."
      badgeText="Platform Auth"
    >
      <div className="space-y-4">
        {reason === 'expired' && (
          <AlertBanner variant="warning" title="Session Expired">
            Your console session expired. Re-authenticate below to resume.
          </AlertBanner>
        )}

        {reason === 'unauthenticated' && (
          <AlertBanner variant="info" title="Sign In Required">
            Please authenticate as a registered platform administrator to view that console page.
          </AlertBanner>
        )}

        {mockEnabled && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Local Frontend Simulation Active</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Authentication uses registered IAM fixtures locally. School tenant credentials are
                explicitly rejected here.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <AlertBanner variant="error" title="Authentication Failed">
            {errorMessage}
          </AlertBanner>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="platform-email"
              className="text-xs font-medium text-foreground block"
            >
              Platform Administrator Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                ref={emailRef}
                id="platform-email"
                name="email"
                type="email"
                autoComplete="username"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@saas-platform.internal"
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="platform-password"
                className="text-xs font-medium text-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                ref={passwordRef}
                id="platform-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
            <span>Keep simulated console session on this browser</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Control Plane'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Development-only IAM Platform Demo Accounts */}
        {process.env.NODE_ENV !== 'production' &&
          devControlsEnabled &&
          demoAccounts.length > 0 && (
            <div className="pt-4 border-t border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Dev Platform Demo Accounts (IAM Fixtures)
                </span>
                <span className="text-[10px] text-muted-foreground">Dev Only</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
                {demoAccounts.map((acct) => (
                  <button
                    key={acct.id}
                    type="button"
                    onClick={() =>
                      handleFillDemoAccount(acct.user.email, acct.demoCredentialHint)
                    }
                    className="text-left p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {acct.user.name}
                      </span>
                      {acct.status === 'active' ? (
                        <Badge variant="info" size="sm">
                          {acct.twoFactorEnabled ? '2FA' : 'Active'}
                        </Badge>
                      ) : (
                        <Badge
                          variant={acct.status === 'suspended' ? 'error' : 'warning'}
                          size="sm"
                        >
                          {acct.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {acct.roleLabel}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </PlatformAuthCard>
  );
}

export default function PlatformLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading Super Admin authentication portal...
        </div>
      }
    >
      <PlatformLoginForm />
    </Suspense>
  );
}
