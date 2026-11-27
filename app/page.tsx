'use client';

import React from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { PlatformOperationsQueues } from '@/components/operations/PlatformOperationsQueues';
import { CANONICAL_TENANT_LIFECYCLE_STATUSES } from '@/lib/lifecycle/canonical-lifecycle';
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
  LifeBuoy,
  CheckSquare,
  AlertOctagon,
} from 'lucide-react';

export default function PlatformOverviewPage() {
  const { can } = usePlatformAuth();
  const {
    metrics,
    organizations,
    subscriptions,
    plans,
    auditEvents,
    operationalComponents,
    operationalOverview,
    operationalQueues,
  } = usePlatformStore();

  const canCreateOrg = can('organizations.create');
  const canReadApprovals = can('operations.approvals.read');
  const canReadExceptions = can('operations.exceptions.read');
  const canReadBilling = can('billing.subscriptions.read');
  const canReadAudit = can('audit.logs.read');
  const canReadSystem = can('system.operations.read');

  const recentAudits = auditEvents.slice(0, 6);

  // Calculate normalized active monthly recurring revenue grouped strictly per currency
  const mrrByCurrency = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    if (sub.status !== 'active' && sub.status !== 'past_due') return acc;
    const plan = plans.find((p) => p.id === sub.planId);
    if (!plan) return acc;
    const monthlyEquivalent =
      sub.billingCycle === 'annual'
        ? plan.priceAnnual / 12
        : sub.billingCycle === 'quarterly'
        ? (plan.priceQuarterly ?? plan.priceMonthly * 3) / 3
        : plan.priceMonthly;
    const curr = (plan.currency || 'USD').toUpperCase();
    acc[curr] = (acc[curr] || 0) + monthlyEquivalent;
    return acc;
  }, {});
  const estimatedUsdMrr = Math.round(mrrByCurrency['USD'] || 0);
  const secondaryMrrSummary = Object.entries(mrrByCurrency)
    .filter(([curr, amt]) => curr !== 'USD' && amt > 0)
    .map(([curr, amt]) => formatCurrency(Math.round(amt), curr))
    .join(' + ');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Tenant Operations Center"
        description="Platform-wide operational telemetry across all 12 P0-5 tenant lifecycle states, support cases, approvals, exceptions, and subscriptions."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {canReadApprovals && (
              <Link
                href="/approvals"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-primary" />
                Approvals ({operationalOverview.pendingApprovalsTotal})
              </Link>
            )}
            {canReadExceptions && (
              <Link
                href="/exceptions"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors"
              >
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                Exceptions ({operationalOverview.openExceptionsTotal})
              </Link>
            )}
            {canCreateOrg && (
              <Link
                href="/organizations/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Onboard School
              </Link>
            )}
          </div>
        }
      />

      {/* Operational Disclaimer Alert */}
      <AlertBanner
        variant="notice"
        title="Frontend Operational Simulation Workspace (No Live Telemetry or Dispatch)"
        dismissible
      >
        All operational metrics, queues, support statuses, approvals, and exceptions are evaluated in-browser from typed deterministic fixtures. Live infrastructure health checks, real tenant provisioning, and external email/SMS dispatches are deferred to backend implementation.
      </AlertBanner>

      {/* Primary KPI Grid (Separated Indicators — Zero Status Conflation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered & Active Tenants"
          value={operationalOverview.totalOrganizations}
          subtitle={`${operationalOverview.activeOrganizations} active • ${operationalOverview.trialOrganizations} trial • ${operationalOverview.suspendedOrganizations} suspended`}
          icon={<Building2 className="w-5 h-5" />}
          badge={{
            label: `${operationalOverview.awaitingActivationOrganizations} Awaiting Activation`,
            variant: operationalOverview.awaitingActivationOrganizations > 0 ? 'warning' : 'neutral',
          }}
        />

        <StatCard
          title="Onboarding & Provisioning Pipeline"
          value={operationalOverview.undergoingOnboardingOrganizations}
          subtitle={`${operationalOverview.incompleteProvisioningOrganizations} incomplete provisioning • ${metrics.onboardingCompleted} completed`}
          icon={<UserCheck className="w-5 h-5" />}
          badge={{
            label: `${operationalQueues.provisioning_exceptions.length} Prov. Exceptions`,
            variant: operationalQueues.provisioning_exceptions.length > 0 ? 'warning' : 'info',
          }}
        />

        <StatCard
          title="Support, Approvals & Exceptions"
          value={operationalOverview.organizationsRequiringAttention}
          subtitle={`Orgs needing attention • ${operationalOverview.unresolvedSupportCasesTotal} open tickets • ${operationalOverview.openExceptionsTotal} exceptions`}
          icon={<LifeBuoy className="w-5 h-5" />}
          badge={{
            label: `${operationalOverview.pendingApprovalsTotal} Pending Approvals`,
            variant: operationalOverview.pendingApprovalsTotal > 0 ? 'warning' : 'success',
          }}
        />

        {canReadBilling ? (
          <StatCard
            title="Estimated Monthly MRR & Exceptions"
            value={formatCurrency(estimatedUsdMrr, 'USD')}
            subtitle={
              secondaryMrrSummary
                ? `+ ${secondaryMrrSummary}/mo • ${operationalOverview.organizationsWithSubscriptionExceptions} billing exception orgs`
                : `${operationalOverview.organizationsWithSubscriptionExceptions} billing exception orgs • ${metrics.systemServicesOperational}/${metrics.systemServicesTotal} services`
            }
            icon={<CreditCard className="w-5 h-5" />}
            badge={{
              label: `${operationalOverview.cancellationPendingOrganizations} Cancelling • ${operationalOverview.cancelledOrganizations + operationalOverview.archivedOrganizations} Closed/Arch`,
              variant: 'neutral',
            }}
          />
        ) : (
          <StatCard
            title="Platform Service Health"
            value={`${metrics.systemServicesOperational}/${metrics.systemServicesTotal}`}
            subtitle={`${operationalOverview.unresolvedSupportCasesTotal} open support tickets • Services operational`}
            icon={<Activity className="w-5 h-5" />}
            badge={{
              label: `${operationalOverview.cancellationPendingOrganizations} Cancelling • ${operationalOverview.cancelledOrganizations + operationalOverview.archivedOrganizations} Closed/Arch`,
              variant: 'neutral',
            }}
          />
        )}
      </div>

      {/* Granular 12-State P0-5 Lifecycle Distribution Strip */}
      <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Canonical 12-State Lifecycle Distribution (Separated from Subscription & Payment)
          </h3>
          <Link href="/organizations" className="text-xs text-primary hover:underline font-medium">
            Open Directory →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {CANONICAL_TENANT_LIFECYCLE_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/organizations?status=${status}`}
              className="p-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 flex items-center justify-between gap-2 transition-colors"
            >
              <span className="truncate capitalize text-[11px] text-muted-foreground">
                {status.replace(/_/g, ' ')}
              </span>
              <span className="font-mono font-bold text-foreground">
                {operationalOverview.byLifecycle[status] || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 10 Actionable Operational Queues */}
      <PlatformOperationsQueues queues={operationalQueues} plans={plans} />

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
              {canReadBilling && (
                <Link
                  href="/subscriptions/plans"
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  Plan Catalogue <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
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
                <p className="text-muted-foreground text-[11px]">Subscription Exceptions</p>
                <p className="text-base font-bold text-foreground mt-0.5">{operationalOverview.organizationsWithSubscriptionExceptions}</p>
              </div>
            </div>
          </div>

          {/* Action Center: High-Priority Suspended, Review & Provisioning Highlights */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  High-Priority Lifecycle & Exception Highlights
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quick highlights from suspended holds, launch sign-offs, and open exceptions.
                </p>
              </div>
              {canReadExceptions && (
                <Link
                  href="/exceptions"
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Open Exceptions Center →
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {operationalQueues.suspended_organizations.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-rose-200/60 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-800 dark:text-rose-300 truncate">
                        {item.organizationName}
                      </span>
                      <Badge variant="error" size="sm">Suspended</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900/40 rounded transition-colors shrink-0"
                  >
                    Inspect
                  </Link>
                </div>
              ))}

              {operationalQueues.awaiting_activation.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-800 dark:text-amber-300 truncate">
                        {item.organizationName}
                      </span>
                      <Badge variant="warning" size="sm">Awaiting Activation</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40 rounded transition-colors shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}

              {operationalQueues.suspended_organizations.length === 0 &&
                operationalQueues.awaiting_activation.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="font-medium text-foreground">No suspended schools or launch holds in queue.</p>
                  <p>Check the 10 Operational Queues above for ongoing onboarding and support items.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity & System Health Snippet */}
        <div className="space-y-6">
          {/* Recent Platform Administrative Activity */}
          {canReadAudit && (
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
          )}

          {/* Quick Nav / System Health Summary */}
          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                Platform Operational Readiness
              </h3>
              {canReadSystem && (
                <Link
                  href="/system-health"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Inspect
                </Link>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {operationalComponents.slice(0, 4).map((comp) => {
                const statusBadge: {
                  variant: 'success' | 'warning' | 'error' | 'neutral';
                  label: string;
                } =
                  comp.status === 'healthy'
                    ? { variant: 'success', label: 'Healthy' }
                    : comp.status === 'critical'
                    ? { variant: 'error', label: 'Critical' }
                    : comp.status === 'degraded' ||
                      comp.status === 'stale' ||
                      comp.status === 'maintenance'
                    ? { variant: 'warning', label: comp.status.replace(/_/g, ' ') }
                    : {
                        variant: 'neutral',
                        label: comp.status === 'not_connected' ? 'Not Connected' : 'Unknown',
                      };

                return (
                  <div
                    key={comp.id}
                    className="p-2 rounded-lg bg-muted/30 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-foreground truncate">{comp.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {comp.category.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Badge variant={statusBadge.variant} size="sm" dot className="capitalize shrink-0">
                      {statusBadge.label}
                    </Badge>
                  </div>
                );
              })}
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
