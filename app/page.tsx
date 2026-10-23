'use client';

import React from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
  Building2,
  CreditCard,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  Activity,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function PlatformOverviewPage() {
  const { metrics, organizations, plans, auditEvents, systemServices } = usePlatformStore();

  const pendingOnboardingOrgs = organizations.filter(
    (o) => o.onboardingStatus === 'in_progress' || o.onboardingStatus === 'verification_pending'
  );

  const suspendedOrgs = organizations.filter((o) => o.status === 'suspended');

  const recentAudits = auditEvents.slice(0, 5);

  // Calculate estimated monthly revenue from mock active subscriptions
  const estimatedMrr = plans.reduce((acc, plan) => {
    const count = organizations.filter((o) => o.planId === plan.id && o.status === 'active').length;
    return acc + count * plan.priceMonthly;
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration Overview"
        description="Global operational indicators, organization lifecycle health, subscription distribution, and administrative tasks."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/organizations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Onboard School
            </Link>
          </div>
        }
      />

      {/* Operational Disclaimer Alert */}
      <AlertBanner
        variant="notice"
        title="Demonstration Operational Model (Phase E-09.21 Certified)"
        dismissible
      >
        All metrics, school directories, plan subscriptions, and audit trails displayed below are calculated from client-side development fixtures and local UI state. Live infrastructure telemetry, payment gateways, and backend authorization will be connected in future development phases.
      </AlertBanner>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Schools"
          value={metrics.totalOrganizations}
          subtitle={`${metrics.activeOrganizations} active • ${metrics.suspendedOrganizations} suspended`}
          icon={<Building2 className="w-5 h-5" />}
          badge={{
            label: `${metrics.pendingOrganizations} Pending`,
            variant: metrics.pendingOrganizations > 0 ? 'warning' : 'neutral',
          }}
        />

        <StatCard
          title="Estimated Monthly ARR/MRR"
          value={formatCurrency(estimatedMrr)}
          subtitle={`${metrics.activeOrganizations} active paid subscriptions`}
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ value: '12.4%', isPositive: true, label: 'vs last quarter' }}
        />

        <StatCard
          title="Onboarding Pipeline"
          value={metrics.onboardingInProgress}
          subtitle={`${metrics.onboardingCompleted} successfully completed`}
          icon={<UserCheck className="w-5 h-5" />}
          badge={{
            label: metrics.trialOrganizations > 0 ? `${metrics.trialOrganizations} on Trial` : 'No Trials',
            variant: 'info',
          }}
        />

        <StatCard
          title="Operational Services"
          value={`${metrics.systemServicesOperational}/${metrics.systemServicesTotal}`}
          subtitle="All core infrastructure operational"
          icon={<Activity className="w-5 h-5" />}
          badge={{
            label: 'Demo Status',
            variant: 'success',
          }}
        />
      </div>

      {/* Two-column Section: Plan Distribution & Attention Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subscription Distribution & Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Breakdown Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Subscription Distribution by Plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Distribution of school organizations across SaaS subscription tiers.
                </p>
              </div>
              <Link
                href="/subscriptions/plans"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                Plan Catalogue <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {metrics.subscriptionsByPlan.map((plan) => {
                const percentage = metrics.totalOrganizations > 0
                  ? Math.round((plan.count / metrics.totalOrganizations) * 100)
                  : 0;

                return (
                  <div key={plan.planId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{plan.planName}</span>
                      <span className="text-muted-foreground font-mono">
                        {plan.count} schools ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: plan.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-muted/30">
                <p className="text-muted-foreground text-[11px]">Free Trials</p>
                <p className="text-base font-bold text-foreground mt-0.5">{metrics.trialOrganizations}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30">
                <p className="text-muted-foreground text-[11px]">Expiring Soon (30d)</p>
                <p className="text-base font-bold text-foreground mt-0.5">{metrics.expiringSoonCount}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30">
                <p className="text-muted-foreground text-[11px]">Inactive Accounts</p>
                <p className="text-base font-bold text-foreground mt-0.5">{metrics.inactiveOrganizations}</p>
              </div>
            </div>
          </div>

          {/* Action Center: Attention Required */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Administrative Action Required
                </h3>
                <p className="text-xs text-muted-foreground">
                  Organizations awaiting identity verification or requiring lifecycle intervention.
                </p>
              </div>
              <Badge variant="warning" size="sm">
                {pendingOnboardingOrgs.length + suspendedOrgs.length} Action Items
              </Badge>
            </div>

            <div className="space-y-3">
              {suspendedOrgs.map((org) => (
                <div
                  key={org.id}
                  className="p-3 rounded-lg border border-rose-200/60 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-800 dark:text-rose-300 truncate">
                        {org.name}
                      </span>
                      <Badge variant="error" size="sm">Suspended</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {org.notes || 'Suspended due to administrative review or overdue billing arrears.'}
                    </p>
                  </div>
                  <Link
                    href={`/organizations/${org.id}`}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900/40 rounded transition-colors shrink-0"
                  >
                    Inspect
                  </Link>
                </div>
              ))}

              {pendingOnboardingOrgs.map((org) => (
                <div
                  key={org.id}
                  className="p-3 rounded-lg border border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-800 dark:text-amber-300 truncate">
                        {org.name}
                      </span>
                      <Badge variant="warning" size="sm">
                        {org.onboardingStatus === 'verification_pending' ? 'Verification Pending' : 'In Progress'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      Administrator: {org.administrator.name} ({org.administrator.email})
                    </p>
                  </div>
                  <Link
                    href={`/organizations/${org.id}`}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40 rounded transition-colors shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}

              {suspendedOrgs.length === 0 && pendingOnboardingOrgs.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="font-medium text-foreground">All organizations are operating normally.</p>
                  <p>No schools are currently suspended or pending onboarding review.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity & System Health Snippet */}
        <div className="space-y-6">
          {/* Recent Platform Administrative Activity */}
          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                Recent Audit Events
              </h3>
              <Link
                href="/audit-logs"
                className="text-xs text-primary hover:underline font-medium"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentAudits.map((event) => (
                <div key={event.id} className="text-xs space-y-1 pb-2.5 border-b border-border/40 last:border-none last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground truncate max-w-[170px]">
                      {event.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {formatDate(event.timestamp, true)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    {event.details}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-mono">
                    By {event.actor.name} • <Badge variant={event.severity === 'critical' ? 'error' : event.severity === 'warning' ? 'warning' : 'neutral'} size="sm">{event.severity}</Badge>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav / System Health Summary */}
          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                Platform Operational Readiness
              </h3>
              <Link
                href="/system-health"
                className="text-xs text-primary hover:underline font-medium"
              >
                Inspect
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {systemServices.slice(0, 4).map((svc) => (
                <div
                  key={svc.id}
                  className="p-2 rounded-lg bg-muted/30 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-foreground truncate">{svc.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{svc.category.replace('_', ' ')}</p>
                  </div>
                  <Badge variant="success" size="sm" dot>
                    Operational
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/50">
              <Link
                href="/organizations"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Go to School Directory
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
