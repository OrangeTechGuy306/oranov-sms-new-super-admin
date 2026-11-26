'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PlatformAuthCard } from '@/components/auth/PlatformAuthCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { platformAuthFlowService } from '@/lib/auth/platformAuthFlowService';

function PlatformForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [simulatedResetUrl, setSimulatedResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid platform administrator email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await platformAuthFlowService.requestPasswordReset(trimmed);
      setSubmittedMessage(res.message);
      if (res.simulatedResetUrl) {
        setSimulatedResetUrl(res.simulatedResetUrl);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PlatformAuthCard
      title="Reset Console Credentials"
      description="Request simulated recovery instructions for a registered platform operator account."
      badgeText="Credential Recovery"
    >
      {submittedMessage ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Recovery Request Recorded</p>
              <p className="text-muted-foreground leading-relaxed">{submittedMessage}</p>
            </div>
          </div>

          {simulatedResetUrl && (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Simulated Dev Recovery Link (No real email was sent)
              </p>
              <Link
                href={simulatedResetUrl}
                className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-[11px] break-all"
              >
                Open Simulated Password Reset <ArrowRight className="w-3 h-3 shrink-0" />
              </Link>
            </div>
          )}

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 w-full h-10 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Console Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <AlertBanner variant="error" title="Invalid Input">
              {error}
            </AlertBanner>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="platform-forgot-email"
              className="text-xs font-medium text-foreground block"
            >
              Platform Administrator Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                id="platform-forgot-email"
                name="email"
                type="email"
                autoComplete="username"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@saas-platform.internal"
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Preparing Recovery...' : 'Request Simulated Reset'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-center pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Console Sign In
            </Link>
          </div>
        </form>
      )}
    </PlatformAuthCard>
  );
}

export default function PlatformForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading recovery portal...
        </div>
      }
    >
      <PlatformForgotPasswordContent />
    </Suspense>
  );
}
