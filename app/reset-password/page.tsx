'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PlatformAuthCard } from '@/components/auth/PlatformAuthCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { platformAuthFlowService } from '@/lib/auth/platformAuthFlowService';

function PlatformResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [tokenStatus, setTokenStatus] = useState<
    'verifying' | 'valid' | 'expired' | 'invalid' | 'missing'
  >(token ? 'verifying' : 'missing');
  const [accountEmail, setAccountEmail] = useState(searchParams.get('email') || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function verify() {
      if (!token) {
        setTokenStatus('missing');
        return;
      }
      const res = await platformAuthFlowService.verifyResetToken(token);
      if (!mounted) return;
      if (res.valid) {
        setTokenStatus('valid');
        if (res.email && !accountEmail) setAccountEmail(res.email);
      } else {
        setTokenStatus(res.reason || 'invalid');
      }
    }
    verify();
    return () => {
      mounted = false;
    };
  }, [token, accountEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 10) {
      setError('Platform administrator password must be at least 10 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await platformAuthFlowService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      setNewPassword('');
      setConfirmPassword('');
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenStatus === 'verifying') {
    return (
      <PlatformAuthCard
        title="Validating Recovery Token"
        description="Checking platform password recovery link..."
        badgeText="Validating"
      >
        <p className="text-xs text-muted-foreground py-6 text-center">
          Verifying recovery token...
        </p>
      </PlatformAuthCard>
    );
  }

  if (tokenStatus !== 'valid') {
    return (
      <PlatformAuthCard
        title="Invalid or Expired Reset Link"
        description="This password recovery token is missing, invalid, or expired."
        badgeText="Recovery Blocked"
      >
        <div className="space-y-4">
          <AlertBanner variant="error" title="Token Validation Failed">
            {tokenStatus === 'expired'
              ? 'This password reset link has expired. Request a new link from Forgot Password.'
              : 'Provide a valid recovery token query parameter (?token=...) from the recovery flow.'}
          </AlertBanner>
          <div className="flex flex-col gap-2">
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95"
            >
              Request New Recovery Link
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </PlatformAuthCard>
    );
  }

  if (isSuccess) {
    return (
      <PlatformAuthCard
        title="Credentials Reset Simulated"
        description="Your simulated password update is complete."
        badgeText="Reset Complete"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Password Updated (Simulated)</p>
              <p className="text-muted-foreground mt-0.5">
                Sign in with your configured administrator account on the console login page.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95"
          >
            Proceed to Console Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </PlatformAuthCard>
    );
  }

  return (
    <PlatformAuthCard
      title="Set New Console Password"
      description={
        accountEmail
          ? `Resetting platform credentials for ${accountEmail}`
          : 'Choose a strong password for your platform administrator account.'
      }
      badgeText="Reset Password"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <AlertBanner variant="error" title="Reset Error">
            {error}
          </AlertBanner>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="platform-new-password"
            className="text-xs font-medium text-foreground block"
          >
            New Password
          </label>
          <p id="platform-pw-hint" className="text-[11px] text-muted-foreground">
            Use at least 10 characters with mixed case, digits, and symbols.
          </p>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
            <input
              id="platform-new-password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-describedby="platform-pw-hint"
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 10 characters"
              required
              className="w-full h-10 pl-9 pr-10 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="platform-confirm-password"
            className="text-xs font-medium text-foreground block"
          >
            Confirm New Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
            <input
              id="platform-confirm-password"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              className="w-full h-10 pl-9 pr-10 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-pressed={showConfirm}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Updating...' : 'Confirm Password Reset'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </PlatformAuthCard>
  );
}

export default function PlatformResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading password reset...
        </div>
      }
    >
      <PlatformResetPasswordContent />
    </Suspense>
  );
}
