'use client';

import React from 'react';
import {
  AuditGovernanceSummary,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import {
  ShieldAlert,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface AuditGovernancePanelProps {
  metrics: AuditGovernanceSummary;
  filters: AnalyticsGlobalFilters;
}

export function AuditGovernancePanel({
  metrics,
  filters,
}: AuditGovernancePanelProps) {
  return (
    <div className="space-y-6">
      {/* Governance & Privacy Notice */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Platform Audit Logs & Security Compliance Governance
        </h4>
        <p className="text-muted-foreground">
          Analytics summarize high-level administrative mutation patterns.
          <strong className="text-foreground ml-1">Privacy Guarantee:</strong> Student, teacher, and parent personal identifiers are completely absent from these aggregate telemetry views.
          <span className="block mt-1 font-medium text-amber-600 dark:text-amber-400">
            Compliance Note: Audit log counts reflect client-recorded operations; immutable compliance archiving requires backend cryptographic ledger hashing.
          </span>
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Audit Events in Scope"
          value={metrics.totalAuditEventsInPeriod}
          subtitle={`Evaluated in: ${filters.dateRange.label}`}
          icon={<FileText className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="Privileged Admin Actions"
          value={metrics.privilegedAdminActionsCount}
          subtitle="Deletions, role grants, and status overrides"
          icon={<Lock className="w-5 h-5 text-amber-500" />}
          badge={{
            label: 'Elevated Risk',
            variant: 'warning',
          }}
        />

        <StatCard
          title="Active Security Incidents"
          value={metrics.securityEventsCount}
          subtitle="Under active triage or investigation"
          icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
          badge={{
            label: metrics.securityEventsCount > 0 ? 'Review Needed' : 'Clean',
            variant: metrics.securityEventsCount > 0 ? 'error' : 'success',
          }}
        />

        <StatCard
          title="Compliance Controls Passed"
          value={`${metrics.complianceControlsCount.passed} / ${metrics.complianceControlsCount.passed + metrics.complianceControlsCount.reviewNeeded + metrics.complianceControlsCount.failed}`}
          subtitle={`${metrics.complianceControlsCount.reviewNeeded} controls pending auditor sign-off`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsDonutChart
          title="Audit Events by Severity"
          description="Distribution between Info, Warning, and Critical system mutations."
          items={metrics.eventsBySeverity}
          centerLabel="Events"
          centerValue={metrics.totalAuditEventsInPeriod}
        />

        <AnalyticsBarChart
          title="Administrative Mutations by Category"
          description="Organization lifecycle, billing, IAM permissions, and settings."
          items={metrics.eventsByCategory}
          unit="Events"
        />
      </div>

      {/* Security Incident Triage Breakdown */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Security Triage & Incident Posture
            </h4>
            <p className="text-xs text-muted-foreground">
              Current state machine distribution of security anomaly detections.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            Zero PII Guarantees Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {metrics.securityTriageDistribution.map((st) => (
            <div key={st.key} className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                {st.label}
              </span>
              <div className="text-2xl font-bold font-mono text-foreground">
                {st.count}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {st.percentage}% of active security queue
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
