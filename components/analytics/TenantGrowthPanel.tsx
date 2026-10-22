'use client';

import React from 'react';
import {
  TenantGrowthMetrics,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { Organization, SubscriptionPlan } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import {
  Building2,
  UserCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface TenantGrowthPanelProps {
  metrics: TenantGrowthMetrics;
  organizations: Organization[];
  plans: SubscriptionPlan[];
  filters: AnalyticsGlobalFilters;
}

export function TenantGrowthPanel({
  metrics,
  organizations,
  plans,
  filters,
}: TenantGrowthPanelProps) {
  const planMap = new Map(plans.map((p) => [p.id, p.name]));

  // Onboarding stage breakdown items
  const onboardingItems = [
    { key: 'completed', label: 'Onboarding Completed', count: metrics.onboardingBreakdown.completed, percentage: Math.round((metrics.onboardingBreakdown.completed / Math.max(1, metrics.totalRegistered)) * 100), colorHex: '#10b981' },
    { key: 'verification_pending', label: 'Verification Pending', count: metrics.onboardingBreakdown.verification_pending, percentage: Math.round((metrics.onboardingBreakdown.verification_pending / Math.max(1, metrics.totalRegistered)) * 100), colorHex: '#3b82f6' },
    { key: 'in_progress', label: 'Self-Serve In Progress', count: metrics.onboardingBreakdown.in_progress, percentage: Math.round((metrics.onboardingBreakdown.in_progress / Math.max(1, metrics.totalRegistered)) * 100), colorHex: '#f59e0b' },
    { key: 'not_started', label: 'Not Started / Stalled', count: metrics.onboardingBreakdown.not_started, percentage: Math.round((metrics.onboardingBreakdown.not_started / Math.max(1, metrics.totalRegistered)) * 100), colorHex: '#64748b' },
  ].filter((it) => it.count > 0);

  // Classification breakdown
  const classificationItems = Object.keys(metrics.classificationBreakdown).map((cls) => ({
    key: cls,
    label: cls.replace(/_/g, ' ').toUpperCase(),
    count: metrics.classificationBreakdown[cls],
    percentage: Math.round((metrics.classificationBreakdown[cls] / Math.max(1, metrics.totalRegistered)) * 100),
  }));

  // Campus footprint breakdown
  const campusItems = [
    { key: 'single', label: 'Single-Campus Schools', count: metrics.campusDistribution.singleCampusCount, percentage: Math.round((metrics.campusDistribution.singleCampusCount / Math.max(1, metrics.totalRegistered)) * 100), colorHex: '#3b82f6' },
    { key: 'multi', label: 'Multi-Branch Networks', count: metrics.campusDistribution.multiCampusCount, percentage: Math.round((metrics.campusDistribution.multiCampusCount / Math.max(1, metrics.totalRegistered)) * 100), colorHex: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Scope and Disclaimer */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Tenant Population & Lifecycle Architecture Governance
        </h4>
        <p className="text-muted-foreground">
          Detailed metrics distinguish registered institutional accounts from newly onboarded cohorts in the reporting period ({filters.dateRange.label}).
          <strong className="text-foreground ml-1">Important:</strong> Registration count indicates presence, not active daily user engagement.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Tenants"
          value={metrics.totalRegistered}
          subtitle="Cumulative platform institutional count"
          icon={<Building2 className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="New Cohort in Period"
          value={metrics.newRegistrationsInPeriod}
          subtitle={`Registered between ${filters.dateRange.startDate} and ${filters.dateRange.endDate}`}
          icon={<Clock className="w-5 h-5 text-emerald-500" />}
          badge={{
            label: `${filters.dateRange.label}`,
            variant: 'info',
          }}
        />

        <StatCard
          title="Active Operational Tenants"
          value={metrics.activeCount}
          subtitle={`${Math.round((metrics.activeCount / Math.max(1, metrics.totalRegistered)) * 100)}% of total platform accounts`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="Suspended / Inactive Accounts"
          value={metrics.suspendedCount + metrics.inactiveCount}
          subtitle={`${metrics.suspendedCount} suspended • ${metrics.inactiveCount} inactive/merged`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          badge={{
            label: metrics.suspendedCount > 0 ? `${metrics.suspendedCount} In Arrears` : 'None Suspended',
            variant: metrics.suspendedCount > 0 ? 'error' : 'neutral',
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsAreaChart
          title="Institutional Registration Trajectory"
          description="Historical monthly cohorts registered on the multi-tenant SaaS platform."
          data={metrics.registrationTimeline}
          unit="Schools"
          color="#3b82f6"
          gradientId="tenantGrowthArea"
        />

        <AnalyticsDonutChart
          title="Onboarding Pipeline Progression"
          description="Self-serve onboarding status and technical verification stages."
          items={onboardingItems}
          centerLabel="Total Orgs"
          centerValue={metrics.totalRegistered}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsBarChart
          title="Institutional Classification Breakdown"
          description="School demographic profiles (K-12, International, Vocational, Higher Ed)."
          items={classificationItems}
          unit="Schools"
        />

        <AnalyticsDonutChart
          title="Campus Infrastructure Footprint"
          description={`Consolidation of ${metrics.campusDistribution.totalCampuses} registered campuses across single vs multi-branch institutions.`}
          items={campusItems}
          centerLabel="Campuses"
          centerValue={metrics.campusDistribution.totalCampuses}
        />
      </div>

      {/* Detailed Tenant Inventory Table */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Filtered School Organization Directory ({organizations.length})
          </h4>
          <span className="text-xs text-muted-foreground font-mono">
            Zero Student PII Exposed
          </span>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="p-2.5">School Name & Code</th>
                <th className="p-2.5">Classification</th>
                <th className="p-2.5">Lifecycle Status</th>
                <th className="p-2.5">Onboarding Stage</th>
                <th className="p-2.5">Plan Tier</th>
                <th className="p-2.5">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-muted/20">
                  <td className="p-2.5">
                    <div className="font-bold text-foreground">{org.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {org.code} • {org.id}
                    </div>
                  </td>
                  <td className="p-2.5 text-muted-foreground capitalize">
                    {org.classification?.replace(/_/g, ' ') || 'Unspecified'}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        org.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : org.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-muted-foreground capitalize">
                    {(org.onboardingStatus || 'not_started').replace(/_/g, ' ')}
                  </td>
                  <td className="p-2.5 font-medium text-foreground">
                    {planMap.get(org.planId) || org.planId}
                  </td>
                  <td className="p-2.5 font-mono text-muted-foreground">
                    {org.createdAt?.split('T')[0] || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
