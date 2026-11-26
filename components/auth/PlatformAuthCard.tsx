'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Terminal, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PLATFORM_AUTH_MODE_LABEL, isPlatformMockAuthEnabled } from '@/lib/auth/platformAuthConfig';

interface PlatformAuthCardProps {
  title: string;
  description: string;
  badgeText?: string;
  children: React.ReactNode;
  footerNotice?: string;
}

export function PlatformAuthCard({
  title,
  description,
  badgeText = 'Platform Governance Console',
  children,
  footerNotice,
}: PlatformAuthCardProps) {
  const mockEnabled =
    process.env.NODE_ENV !== 'production' && isPlatformMockAuthEnabled();

  return (
    <div className="min-h-screen flex flex-col justify-center bg-background text-foreground px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        {/* Enterprise SaaS Left Brand Panel */}
        <aside className="hidden lg:flex flex-col justify-between p-8 bg-slate-950 text-slate-100 border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-white">
                  SMS Control Plane
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-blue-400">
                  Super-Admin Console
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-lg font-semibold leading-snug text-white">
                Multi-Tenant SaaS Governance & Operations
              </h2>
              <p className="text-xs leading-relaxed text-slate-300">
                Centralized administration for institutional tenant onboarding, subscriptions,
                cross-school compliance audits, and platform IAM access control.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Strict Identity Separation</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Platform operator sessions are isolated from school tenant accounts.
                    School principals or staff cannot authenticate here.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">IAM & Audit Alignment</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Authentication binds directly to registered PlatformUser identities and
                    evaluated effective IAM role permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>SaaS Control Plane v16</span>
            <Link
              href="/403"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              Access Policy <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Form Content Column */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Mobile Brand Header */}
            <div className="flex items-center justify-between gap-2 lg:hidden pb-2 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-foreground">
                  SMS Control Plane
                </span>
              </div>
              <Badge variant={mockEnabled ? 'warning' : 'info'} size="sm">
                {mockEnabled ? 'Dev Simulation' : 'Super Admin'}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="hidden lg:flex items-center justify-between gap-2 mb-1">
                <Badge variant={mockEnabled ? 'warning' : 'info'} size="sm">
                  {mockEnabled ? PLATFORM_AUTH_MODE_LABEL : badgeText}
                </Badge>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {children}
          </div>

          <div className="pt-4 border-t border-border text-[11px] text-muted-foreground space-y-1">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {footerNotice ||
                  (mockEnabled
                    ? 'Frontend Simulation Only: No live identity server or session token issuance is active.'
                    : 'Enterprise Super Admin Portal')}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
