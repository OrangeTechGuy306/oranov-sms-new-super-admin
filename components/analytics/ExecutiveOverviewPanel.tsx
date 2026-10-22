'use client';

import React from 'react';
import {
  ExecutiveKpiSummary,
  TenantGrowthMetrics,
  SubscriptionsAnalyticsSummary,
  ModuleAdoptionMetrics,
  SupportAnalyticsSummary,
  OperationsAnalyticsSummary,
  CommunicationsAnalyticsSummary,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Building2,
  CreditCard,
  Layers,
  LifeBuoy,
  Activity,
  Bell,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ExecutiveOverviewPanelProps {
  kpi: ExecutiveKpiSummary;
  tenantGrowth: TenantGrowthMetrics;
  monetization: SubscriptionsAnalyticsSummary;
  modules: ModuleAdoptionMetrics;
  support: SupportAnalyticsSummary;
  operations: OperationsAnalyticsSummary;
  communications: CommunicationsAnalyticsSummary;
  filters: AnalyticsGlobalFilters;
  onNavigateTab: (tabId: string) => void;
}

export function ExecutiveOverviewPanel({
  kpi,
  tenantGrowth,
  monetization,
  modules,
  support,
  operations,
  communications,
  filters,
  onNavigateTab,
}: ExecutiveOverviewPanelProps) {
  // Plan breakdown for donut chart
  const planItems = monetization.planDistribution;

  // Lifecycle breakdown
  const lifecycleItems = [
    { key: 'active', label: 'Active', count: tenantGrowth.activeCount, percentage: Math.round((tenantGrowth.activeCount / Math.max(1, tenantGrowth.totalRegistered)) * 100), colorHex: '#10b981' },
    { key: 'pending', label: 'Pending Onboarding', count: tenantGrowth.pendingCount, percentage: Math.round((tenantGrowth.pendingCount / Math.max(1, tenantGrowth.totalRegistered)) * 100), colorHex: '#f59e0b' },
    { key: 'suspended', label: 'Suspended', count: tenantGrowth.suspendedCount, percentage: Math.round((tenantGrowth.suspendedCount / Math.max(1, tenantGrowth.totalRegistered)) * 100), colorHex: '#ef4444' },
    { key: 'inactive', label: 'Inactive / Merged', count: tenantGrowth.inactiveCount, percentage: Math.round((tenantGrowth.inactiveCount / Math.max(1, tenantGrowth.totalRegistered)) * 100), colorHex: '#64748b' },
  ].filter((it) => it.count > 0);

  // Top module adoption items
  const topModuleItems = modules.topAdoptedModules.slice(0, 5).map((m) => ({
    key: m.moduleId,
    label: m.name,
    count: m.enabledTenantCount,
    percentage: m.totalAdoptionRatePercent,
  }));

  return (
    <div className="space-y-6">
      {/* Demo Notice Banner */}
      <div className="p-3.5 bg-card border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-foreground font-medium">
            Executive figures are synthesized client-side from verified local fixtures. No live third-party billing webhooks or production APM agents are currently linked.
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0 hidden md:inline">
          Reporting Scope: {filters.dateRange.label}
        </span>
      </div>

      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Schools"
          value={kpi.totalOrganizations}
          subtitle={`${kpi.activeOrganizations} active • ${kpi.newOrganizationsInPeriod} new in period`}
          icon={<Building2 className="w-5 h-5 text-primary" />}
          badge={{
            label: kpi.pendingOrganizations > 0 ? `${kpi.pendingOrganizations} Pending` : 'All Provisioned',
            variant: kpi.pendingOrganizations > 0 ? 'warning' : 'neutral',
          }}
          onClick={() => onNavigateTab('tenant_growth')}
        />

        <StatCard
          title="Projected Monthly Run-Rate"
          value={formatCurrency(kpi.estimatedMrrUsd, 'USD')}
          subtitle={`ARR: ${formatCurrency(kpi.estimatedArrUsd, 'USD')} (${kpi.totalActiveSubscriptions} paid)`}
          icon={<CreditCard className="w-5 h-5 text-emerald-500" />}
          trend={{
            value: `${kpi.totalActiveSubscriptions} subs`,
            isPositive: true,
            label: 'USD isolated',
          }}
          onClick={() => onNavigateTab('monetization')}
        />

        <StatCard
          title="Module Adoption Health"
          value={`${kpi.platformModuleAdoptionRate}%`}
          subtitle={`Across ${modules.totalModulesInRegistry} platform modules in registry`}
          icon={<Layers className="w-5 h-5 text-purple-500" />}
          onClick={() => onNavigateTab('module_adoption')}
        />

        <StatCard
          title="Open Support Backlog"
          value={kpi.openSupportTicketsCount}
          subtitle={`${kpi.urgentTicketsCount} urgent • SLA: ${kpi.slaComplianceRate}% met`}
          icon={<LifeBuoy className="w-5 h-5 text-amber-500" />}
          badge={{
            label: kpi.urgentTicketsCount > 0 ? `${kpi.urgentTicketsCount} Urgent` : 'Normal Load',
            variant: kpi.urgentTicketsCount > 0 ? 'error' : 'success',
          }}
          onClick={() => onNavigateTab('support_cs')}
        />
      </div>

      {/* Secondary Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('operations')}
          className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-3 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> System Availability
            </span>
            <div className="text-xl font-bold text-foreground">
              {kpi.systemOperationalRatio}% Operational
            </div>
            <p className="text-[11px] text-muted-foreground">
              {operations.operationalComponents} of {operations.totalComponents} telemetry components green
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        </div>

        <div
          onClick={() => onNavigateTab('communications')}
          className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-3 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-500" /> Dispatch Delivery Rate
            </span>
            <div className="text-xl font-bold text-foreground">
              {kpi.notificationDeliveryRate}%
            </div>
            <p className="text-[11px] text-muted-foreground">
              {communications.deliveredCount} delivered • {communications.failedCount} carrier bounces
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        </div>

        <div
          onClick={() => onNavigateTab('audit_governance')}
          className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-3 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Governance & Security
            </span>
            <div className="text-xl font-bold text-foreground">
              {kpi.securityIncidentsUnderReview} Pending Triage
            </div>
            <p className="text-[11px] text-muted-foreground">
              {kpi.recentAuditEventsCount} audit events in period • Zero PII guaranteed
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        </div>
      </div>

      {/* Primary Chart Area: Tenant Registrations Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsAreaChart
            title="School Organization Registrations Timeline"
            description="Cumulative institutional sign-ups by monthly onboarding cohort."
            data={tenantGrowth.registrationTimeline}
            unit="Schools"
            color="#3b82f6"
            gradientId="execTenantTimeline"
            height={240}
          />
        </div>

        <div>
          <AnalyticsDonutChart
            title="Tenant Lifecycle Distribution"
            description="Active, pending, and suspended institutional accounts."
            items={lifecycleItems}
            centerLabel="Total Orgs"
            centerValue={tenantGrowth.totalRegistered}
          />
        </div>
      </div>

      {/* Secondary Chart Grid: Plan Adoption and Top Module Enablement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsDonutChart
          title="Subscription Plan Adoption"
          description="Distribution of active school organizations across plan tiers."
          items={planItems}
          centerLabel="Plans"
        />

        <AnalyticsBarChart
          title="Top Adopted Platform Modules"
          description="Percentage of active organizations with module entitlement enabled."
          items={topModuleItems}
          unit="Schools"
          showPercentages
        />
      </div>

      {/* Quick Jump Links to Detailed Analytics Domains */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Detailed Business Intelligence Workspaces
        </h4>
        <p className="text-xs text-muted-foreground">
          Drill down into domain-specific operational indicators, compliance audit ledgers, or generate custom data exports.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
          {[
            { id: 'tenant_growth', label: 'Tenant Growth' },
            { id: 'monetization', label: 'Monetization & Billing' },
            { id: 'module_adoption', label: 'Module Registry' },
            { id: 'support_cs', label: 'Support & Success' },
            { id: 'operations', label: 'Platform Operations' },
            { id: 'reports_exports', label: 'Reports & Exports' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateTab(item.id)}
              className="p-2.5 rounded-lg border border-border/80 hover:border-primary/50 hover:bg-muted/30 text-foreground font-semibold flex items-center justify-between gap-1 transition-all text-left cursor-pointer"
            >
              <span className="truncate">{item.label}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
