'use client';

import React from 'react';
import {
  SupportAnalyticsSummary,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import {
  LifeBuoy,
  Timer,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';

interface SupportSuccessPanelProps {
  metrics: SupportAnalyticsSummary;
  filters: AnalyticsGlobalFilters;
}

export function SupportSuccessPanel({
  metrics,
  filters,
}: SupportSuccessPanelProps) {
  // Account Health breakdown items for Donut
  const healthItems = [
    { key: 'healthy', label: 'Healthy (Zero Open Issues)', count: metrics.customerSuccessHealthDistribution.healthy, percentage: Math.round((metrics.customerSuccessHealthDistribution.healthy / Math.max(1, metrics.customerSuccessHealthDistribution.totalAccounts)) * 100), colorHex: '#10b981' },
    { key: 'neutral', label: 'Neutral (Standard Inquiries)', count: metrics.customerSuccessHealthDistribution.neutral, percentage: Math.round((metrics.customerSuccessHealthDistribution.neutral / Math.max(1, metrics.customerSuccessHealthDistribution.totalAccounts)) * 100), colorHex: '#3b82f6' },
    { key: 'at_risk', label: 'At-Risk (SLA Warning / High Volume)', count: metrics.customerSuccessHealthDistribution.at_risk, percentage: Math.round((metrics.customerSuccessHealthDistribution.at_risk / Math.max(1, metrics.customerSuccessHealthDistribution.totalAccounts)) * 100), colorHex: '#f59e0b' },
    { key: 'critical', label: 'Critical (Suspended / Overdue SLA)', count: metrics.customerSuccessHealthDistribution.critical, percentage: Math.round((metrics.customerSuccessHealthDistribution.critical / Math.max(1, metrics.customerSuccessHealthDistribution.totalAccounts)) * 100), colorHex: '#ef4444' },
  ].filter((it) => it.count > 0);

  // CSAT rating breakdown
  const csatBarItems = [5, 4, 3, 2, 1].map((rating) => ({
    key: `rating_${rating}`,
    label: `${rating} Star${rating > 1 ? 's' : ''}`,
    count: metrics.csatDistribution.distribution[rating] || 0,
    percentage: metrics.csatDistribution.totalRatings > 0
      ? Math.round(((metrics.csatDistribution.distribution[rating] || 0) / metrics.csatDistribution.totalRatings) * 100)
      : 0,
    colorHex: rating >= 4 ? '#10b981' : rating === 3 ? '#f59e0b' : '#ef4444',
  }));

  return (
    <div className="space-y-6">
      {/* SLA & Evaluation Notice */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-primary" />
          Support Desk SLA & Customer Success Operations
        </h4>
        <p className="text-muted-foreground">
          Reporting period: <strong className="text-foreground">{filters.dateRange.label}</strong> ({filters.dateRange.startDate} to {filters.dateRange.endDate}).
          <span className="block mt-1">
            <strong>Timing semantics:</strong> First response time is calculated strictly from responded tickets. Resolution time excludes ongoing unresolved tickets so as not to prematurely depress elapsed averages.
          </span>
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Ticket Backlog"
          value={metrics.currentlyOpenTickets}
          subtitle={`${metrics.unassignedTickets} unassigned • ${metrics.overdueTickets} SLA breached`}
          icon={<LifeBuoy className="w-5 h-5 text-amber-500" />}
          badge={{
            label: metrics.overdueTickets > 0 ? `${metrics.overdueTickets} Overdue` : 'Within Target',
            variant: metrics.overdueTickets > 0 ? 'error' : 'success',
          }}
        />

        <StatCard
          title="SLA Compliance Rate"
          value={`${metrics.slaCompliancePercent}%`}
          subtitle="Contractual response & resolution achievement"
          icon={<Timer className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="Avg First Response"
          value={metrics.avgFirstResponseMinutes !== null ? `${metrics.avgFirstResponseMinutes}m` : 'N/A'}
          subtitle="Target: ≤ 30m (Mission-Critical / Gold)"
          icon={<Clock className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="Avg Resolution Time"
          value={metrics.avgResolutionHours !== null ? `${metrics.avgResolutionHours}h` : 'N/A'}
          subtitle={`${metrics.resolvedTicketsInPeriod} tickets completed in period`}
          icon={<CheckCircle2 className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Secondary CSAT & CS Tasks Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" /> CSAT Satisfaction Score
          </span>
          <div className="text-2xl font-bold text-foreground">
            {metrics.csatDistribution.averageRating !== null ? `${metrics.csatDistribution.averageRating} / 5.0` : 'No Ratings'}
          </div>
          <p className="text-[11px] text-muted-foreground">
            From {metrics.csatDistribution.totalRatings} verified administrator surveys
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-rose-500" /> At-Risk Institutional Accounts
          </span>
          <div className="text-2xl font-bold text-foreground">
            {metrics.customerSuccessHealthDistribution.at_risk + metrics.customerSuccessHealthDistribution.critical}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {metrics.customerSuccessHealthDistribution.critical} critical • {metrics.customerSuccessHealthDistribution.at_risk} requiring CSM contact
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" /> Follow-Up CSM Tasks
          </span>
          <div className="text-2xl font-bold text-foreground">
            {metrics.pendingCsTasksCount} Pending
          </div>
          <p className="text-[11px] text-muted-foreground">
            {metrics.overdueCsTasksCount} tasks past due date
          </p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsDonutChart
          title="Customer Success Health Scoring"
          description="Institutional account health based on SLA adherence and billing stability."
          items={healthItems}
          centerLabel="Accounts"
          centerValue={metrics.customerSuccessHealthDistribution.totalAccounts}
        />

        <AnalyticsBarChart
          title="Customer Satisfaction (CSAT) Distribution"
          description="Survey ratings submitted post-ticket resolution."
          items={csatBarItems}
          unit="Surveys"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsBarChart
          title="Ticket Backlog by Functional Category"
          description="Support requests partitioned across platform modules."
          items={metrics.categoryBreakdown}
          unit="Tickets"
        />

        <AnalyticsBarChart
          title="Priority & Severity Distribution"
          description="Urgent exam blockers, high billing inquiries, and normal requests."
          items={metrics.priorityBreakdown}
          unit="Tickets"
        />
      </div>
    </div>
  );
}
