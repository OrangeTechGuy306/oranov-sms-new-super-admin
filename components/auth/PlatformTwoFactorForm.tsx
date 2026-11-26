'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  ArrowRight,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { platformAuthFlowService } from '@/lib/auth/platformAuthFlowService';
import { isPlatformMockAuthEnabled } from '@/lib/auth/platformAuthConfig';
import { AlertBanner } from '@/components/ui/AlertBanner';
import Link from 'next/link';

interface PlatformTwoFactorFormProps {
  returnUrl: string;
}

export function PlatformTwoFactorForm({ returnUrl }: PlatformTwoFactorFormProps) {
  const router = useRouter();
  const { pendingTwoFactor, completeTwoFactor, cancelTwoFactor, isAuthenticated } =
    usePlatformAuth();

  const [code, setCode] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    () => pendingTwoFactor?.attemptsRemaining ?? null
  );
  const [resendCooldown, setResendCooldown] = useState(
    () => pendingTwoFactor?.resendCooldownSeconds ?? 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockEnabled =
    process.env.NODE_ENV !== 'production' && isPlatformMockAuthEnabled();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  if (!pendingTwoFactor) {
    return (
      <div className="space-y-4">
        <AlertBanner variant="warning" title="No Pending Verification Challenge">
          Start authentication on the Super Admin login page before completing
          two-factor verification.
        </AlertBanner>
        <Link
          href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
          className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95"
        >
          Return to Console Sign In
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter your verification code to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeTwoFactor({
        challengeId: pendingTwoFactor.challengeId,
        email: pendingTwoFactor.email,
        code: trimmed,
        isRecovery: isRecoveryMode,
        rememberDevice,
      });

      if (res.success) {
        router.replace(returnUrl);
      } else {
        if (typeof res.attemptsRemaining === 'number') {
          setAttemptsRemaining(res.attemptsRemaining);
        }
        setError(res.error || 'Verification failed.');
        setCode('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError(null);
    const res = await platformAuthFlowService.resendTwoFactorChallenge(
      pendingTwoFactor.challengeId
    );
    if (res.cooldownSeconds) {
      setResendCooldown(res.cooldownSeconds);
    }
    if (res.success) {
      setNotice(res.message);
    } else {
      setError(res.error || res.message);
    }
  };

  const handleCancel = async () => {
    setCode('');
    setError(null);
    setNotice(null);
    await cancelTwoFactor();
    router.replace('/login');
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-foreground">
            Verifying administrator <strong>{pendingTwoFactor.userName}</strong> (
            <span className="font-mono">{pendingTwoFactor.email}</span>)
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            {pendingTwoFactor.simulatedNotice}
          </p>
        </div>
      </div>

      {error && (
        <AlertBanner variant="error" title="Verification Error">
          {error}
        </AlertBanner>
      )}

      {notice && (
        <AlertBanner variant="info" title="Simulated Refresh">
          {notice}
        </AlertBanner>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="platform-2fa-code"
            className="text-xs font-medium text-foreground block"
          >
            {isRecoveryMode
              ? 'Single-Use Platform Recovery Code'
              : '6-Digit Verification Code'}
          </label>
          <p id="platform-2fa-hint" className="text-[11px] text-muted-foreground">
            {isRecoveryMode
              ? 'Enter one of your emergency recovery codes (e.g. PLAT-REC-1001). Each recovery code can only be used once.'
              : 'Simulation rule: enter any 6 digits other than 000000.'}
          </p>
          <div className="relative flex items-center">
            <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
            <input
              id="platform-2fa-code"
              name="otp"
              type="text"
              autoFocus
              autoComplete="one-time-code"
              spellCheck={false}
              inputMode={isRecoveryMode ? 'text' : 'numeric'}
              maxLength={isRecoveryMode ? 20 : 6}
              aria-describedby="platform-2fa-hint"
              aria-invalid={Boolean(error)}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder={isRecoveryMode ? 'PLAT-REC-1001' : '123456'}
              required
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {attemptsRemaining !== null && (
            <p className="text-[11px] text-muted-foreground">
              Attempts remaining:{' '}
              <span className="font-mono font-semibold text-foreground">
                {attemptsRemaining}
              </span>
            </p>
          )}
        </div>

        {isRecoveryMode &&
          mockEnabled &&
          pendingTwoFactor.simulatedRecoveryCodesHint &&
          pendingTwoFactor.simulatedRecoveryCodesHint.length > 0 && (
            <div className="p-2.5 rounded-lg bg-muted/60 border border-border text-[11px] space-y-1">
              <div className="font-semibold text-foreground">
                Dev-only sample recovery codes (single-use):
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {pendingTwoFactor.simulatedRecoveryCodesHint.map((recCode) => (
                  <button
                    key={recCode}
                    type="button"
                    onClick={() => {
                      setCode(recCode);
                      setError(null);
                    }}
                    className="px-2 py-0.5 rounded bg-background border border-border hover:border-primary text-foreground cursor-pointer"
                  >
                    {recCode}
                  </button>
                ))}
              </div>
            </div>
          )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setIsRecoveryMode(!isRecoveryMode);
              setCode('');
              setError(null);
            }}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            {isRecoveryMode
              ? 'Use 6-digit verification code'
              : 'Use single-use recovery code'}
          </button>

          {!isRecoveryMode && (
            <button
              type="button"
              disabled={resendCooldown > 0 || isSubmitting}
              onClick={handleResend}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3 h-3" />
              <span>
                {resendCooldown > 0
                  ? `Simulate resend (${resendCooldown}s)`
                  : 'Simulate resend'}
              </span>
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
          />
          <span>Extend simulated console session (12h)</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Access Console'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-card text-foreground text-xs font-medium hover:bg-muted cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
