'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { PlatformAuthCard } from '@/components/auth/PlatformAuthCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { platformAuthFlowService } from '@/lib/auth/platformAuthFlowService';
import type { PlatformInvitationDetails } from '@/lib/types/auth';

function PlatformAcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token =
    searchParams.get('token') ||
    searchParams.get('invite') ||
    '';

  const [status, setStatus] = useState<
    'verifying' | 'valid' | 'missing' | 'invalid' | 'expired' | 'already_used'
  >(token ? 'verifying' : 'missing');
  const [invitation, setInvitation] = useState<PlatformInvitationDetails | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function verify() {
      if (!token) {
        setStatus('missing');
        return;
      }
      const res = await platformAuthFlowService.verifyInvitation(token);
      if (!mounted) return;
      if (res.valid && res.invitation) {
        setStatus('valid');
        setInvitation(res.invitation);
        setName(res.invitation.name);
      } else {
        setStatus(res.reason || 'invalid');
      }
    }
    verify();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Full administrator name is required.');
      return;
    }
    if (password.length < 10) {
      setError('Administrator password must be at least 10 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await platformAuthFlowService.acceptInvitation({
        token,
        name: name.trim(),
        password,
      });
      setPassword('');
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

  if (status === 'verifying') {
    return (
      <PlatformAuthCard
        title="Validating Administrator Invitation"
        description="Inspecting platform onboarding token..."
        badgeText="Onboarding"
      >
        <p className="text-xs text-muted-foreground py-6 text-center">
          Validating invitation token...
        </p>
      </PlatformAuthCard>
    );
  }

  if (status !== 'valid' || !invitation) {
    return (
      <PlatformAuthCard
        title="Platform Invitation Unavailable"
        description="The onboarding token is missing, invalid, already claimed, or expired."
        badgeText="Token Invalid"
      >
        <div className="space-y-4">
          <AlertBanner variant="error" title="Invitation Cannot Be Processed">
            {status === 'missing'
              ? 'No invitation token was supplied (?token=...).'
              : status === 'expired'
              ? 'This platform administrator invitation has expired.'
              : status === 'already_used'
              ? 'This invitation was already claimed.'
              : 'Unrecognized platform onboarding token.'}
          </AlertBanner>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 w-full h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Console Sign In
          </Link>
        </div>
      </PlatformAuthCard>
    );
  }

  if (isSuccess) {
    return (
      <PlatformAuthCard
        title="Platform Administrator Initialized"
        description="Your simulated Super Admin console onboarding is complete."
        badgeText="Onboarding Complete"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Account Provisioning Simulated</p>
              <p className="text-muted-foreground mt-0.5">
                {invitation.email} has been configured for role{' '}
                <strong>{invitation.roleLabel}</strong>. Sign in via /login.
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
      title="Accept Platform Invitation"
      description="Verify your assigned IAM role and set up console access."
      badgeText="Operator Onboarding"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Invited Email</span>
            <span className="font-mono font-medium text-foreground">{invitation.email}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Department</span>
            <span className="text-foreground">{invitation.department}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Assigned Platform Role</span>
            <Badge variant="info" size="sm">
              <Shield className="w-3 h-3 mr-1" />
              {invitation.roleLabel}
            </Badge>
          </div>
        </div>

        {error && (
          <AlertBanner variant="error" title="Onboarding Error">
            {error}
          </AlertBanner>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="platform-invite-name"
              className="text-xs font-medium text-foreground block"
            >
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                id="platform-invite-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="platform-invite-password"
              className="text-xs font-medium text-foreground block"
            >
              Create Console Password (min. 10 characters)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                id="platform-invite-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              htmlFor="platform-invite-confirm"
              className="text-xs font-medium text-foreground block"
            >
              Confirm Console Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                id="platform-invite-confirm"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Activating Account...' : 'Accept Platform Invitation'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </PlatformAuthCard>
  );
}

export default function PlatformAcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading platform invitation...
        </div>
      }
    >
      <PlatformAcceptInvitationContent />
    </Suspense>
  );
}
