'use client';

import React from 'react';
import {
  Database,
  ShieldAlert,
  Clock,
  UserCheck,
  FileText,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { GovernanceMetricsSummary } from '@/lib/types/data-governance';

interface GovernanceOverviewTabProps {
  metrics: GovernanceMetricsSummary;
  onNavigateTab: (tab: string) => void;
}

export function GovernanceOverviewTab({ metrics, onNavigateTab }: GovernanceOverviewTabProps) {
  const kpis = [
    {
      id: 'registered-categories',
      title: 'Registered Data Categories',
      value: metrics.totalCategories,
      scope: 'Platform Data Inventory',
      definition: 'All defined institutional, student, staff, and system metadata collections.',
      statusBadge: 'Demo Fixture',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      tab: 'inventory',
      icon: Database,
      isAlert: false,
    },
    {
      id: 'classified-categories',
      title: 'Classified Categories',
      value: `${metrics.classifiedCategories} / ${metrics.totalCategories}`,
      scope: 'Classification Coverage',
      definition: 'Categories assigned a sensitivity rating (Public, Internal, Confidential, Restricted).',
      statusBadge: 'Proposed Schema',
      statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      tab: 'inventory',
      icon: Layers,
      isAlert: metrics.classifiedCategories < metrics.totalCategories,
    },
    {
      id: 'configured-retention',
      title: 'Configured Retention Policies',
      value: metrics.totalRetentionPolicies,
      scope: 'Demo Schedule Catalog',
      definition: 'Configured schedules mapping statutory retention rules to educational data.',
      statusBadge: 'Static Config',
      statusColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      tab: 'retention',
      icon: Clock,
      isAlert: false,
    },
    {
      id: 'uncovered-categories',
      title: 'Uncovered Data Categories',
      value: metrics.uncoveredCategoriesCount,
      scope: 'Retention Gap Analysis',
      definition: 'Registered data categories currently missing an associated retention policy.',
      statusBadge: 'Requires Action',
      statusColor:
        metrics.uncoveredCategoriesCount > 0
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      tab: 'inventory',
      icon: AlertTriangle,
      isAlert: metrics.uncoveredCategoriesCount > 0,
    },
    {
      id: 'policies-due-review',
      title: 'Policies Due for Review',
      value: metrics.policiesDueForReviewCount,
      scope: 'Annual Governance Audit',
      definition: 'Retention schedules whose governance review date has passed or is within 30 days.',
      statusBadge: 'Demo Schedule',
      statusColor:
        metrics.policiesDueForReviewCount > 0
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      tab: 'retention',
      icon: Calendar,
      isAlert: metrics.policiesDueForReviewCount > 0,
    },
    {
      id: 'open-privacy-requests',
      title: 'Open Privacy Requests (DSAR)',
      value: metrics.openPrivacyRequestsCount,
      scope: 'Subject Access Register',
      definition: 'Simulated data subject requests (access, rectification, erasure, restriction).',
      statusBadge: 'Simulated Queue',
      statusColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
      tab: 'requests',
      icon: UserCheck,
      isAlert: false,
    },
    {
      id: 'overdue-privacy-requests',
      title: 'Overdue Privacy Requests',
      value: metrics.overduePrivacyRequestsCount,
      scope: '30-Day SLA Horizon',
      definition: 'Simulated requests exceeding standard 30-day statutory resolution windows.',
      statusBadge: 'SLA Warning',
      statusColor:
        metrics.overduePrivacyRequestsCount > 0
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      tab: 'requests',
      icon: ShieldAlert,
      isAlert: metrics.overduePrivacyRequestsCount > 0,
    },
    {
      id: 'active-lifecycle-rules',
      title: 'Active Data Lifecycle Rules',
      value: metrics.totalLifecycleRules,
      scope: 'Automated Rule Catalog',
      definition: 'Declarative stage progression rules (Restricted, Archived, Tombstoned).',
      statusBadge: 'Demo Catalog',
      statusColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
      tab: 'lifecycle',
      icon: FileText,
      isAlert: false,
    },
    {
      id: 'exceptions-awaiting-review',
      title: 'Policy Exceptions Awaiting Review',
      value: metrics.exceptionsAwaitingReviewCount,
      scope: 'Legal Holds & Disputes',
      definition: 'Formal overrides pausing retention deletions for litigation or audits.',
      statusBadge: 'Pending Counsel',
      statusColor:
        metrics.exceptionsAwaitingReviewCount > 0
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      tab: 'exceptions',
      icon: AlertTriangle,
      isAlert: metrics.exceptionsAwaitingReviewCount > 0,
    },
    {
      id: 'incomplete-tenants',
      title: 'Tenants Incomplete Governance',
      value: metrics.tenantsWithIncompleteGovernanceCount,
      scope: 'Tenant Configuration Audit',
      definition: 'School organizations with classification or retention coverage below 80%.',
      statusBadge: 'Aggregate Scan',
      statusColor:
        metrics.tenantsWithIncompleteGovernanceCount > 0
          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      tab: 'tenants',
      icon: Building2,
      isAlert: metrics.tenantsWithIncompleteGovernanceCount > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 10 KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Key Governance Health Indicators
          </h2>
          <span className="text-[11px] text-muted-foreground">
            All values derived from demo state and static configuration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-xs dark:hover:border-indigo-800"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground line-clamp-1">
                      {kpi.scope}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium shrink-0 ${kpi.statusColor}`}
                    >
                      {kpi.statusBadge}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {kpi.value}
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-1 text-xs font-semibold text-foreground">
                    {kpi.title}
                  </div>

                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                    {kpi.definition}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground text-[10px]">Scope: Platform</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab(kpi.tab)}
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Breakdowns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Classification Level Distribution */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Proposed Classification Distribution
            </h3>
            <span className="text-[10px] text-muted-foreground">{metrics.totalCategories} Categories</span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Restricted (Safeguarding, Medical)',
                count: metrics.classificationDistribution.restricted,
                color: 'bg-rose-500',
              },
              {
                label: 'Confidential (Grades, Admissions, Staff)',
                count: metrics.classificationDistribution.confidential,
                color: 'bg-amber-500',
              },
              {
                label: 'Internal (Attendance, Audit, Support)',
                count: metrics.classificationDistribution.internal,
                color: 'bg-blue-500',
              },
              {
                label: 'Public (Campus Directory, Term Dates)',
                count: metrics.classificationDistribution.public,
                color: 'bg-emerald-500',
              },
            ].map((item) => {
              const pct = Math.round((item.count / (metrics.totalCategories || 1)) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-bold text-foreground">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/50">
            <span className="font-semibold text-foreground text-[10px] uppercase tracking-wider block mb-1">
              Data Classification Summary
            </span>
            <p className="leading-relaxed">
              <strong>{metrics.classificationDistribution.restricted}</strong> restricted categories mandate strict zero-PII
              masking and FERPA/COPPA controls. <strong>{metrics.classificationDistribution.confidential}</strong> confidential
              categories require role-scoped authorization.
            </p>
          </div>
        </div>

        {/* Privacy Request Lifecycle Distribution */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Simulated Privacy Request Statuses
            </h3>
            <span className="text-[10px] text-muted-foreground">DSAR Register</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                label: 'Received / Identity Verification',
                count:
                  metrics.requestStatusDistribution.received +
                  metrics.requestStatusDistribution.identity_verification_pending,
                color: 'bg-slate-400',
              },
              {
                label: 'Under Review / Legal Evaluation',
                count: metrics.requestStatusDistribution.under_review,
                color: 'bg-blue-500',
              },
              {
                label: 'Awaiting External Information',
                count: metrics.requestStatusDistribution.awaiting_info,
                color: 'bg-amber-500',
              },
              {
                label: 'Approved Demo / In Simulation',
                count:
                  metrics.requestStatusDistribution.approved_pending_execution +
                  metrics.requestStatusDistribution.processing_simulated,
                color: 'bg-indigo-500',
              },
              {
                label: 'Completed / Closed',
                count: metrics.requestStatusDistribution.completed_closed,
                color: 'bg-emerald-500',
              },
              {
                label: 'Rejected (Statutory Override)',
                count: metrics.requestStatusDistribution.rejected_with_grounds,
                color: 'bg-rose-500',
              },
            ].map((item) => {
              const total = 7;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-foreground">{item.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-sky-50/60 p-2.5 text-[11px] text-sky-900 dark:bg-sky-950/30 dark:text-sky-200 border border-sky-200/60 dark:border-sky-900/50">
            <div className="flex items-center gap-1.5 font-semibold text-[10px] mb-1">
              <Info className="h-3.5 w-3.5 text-sky-600" />
              Simulated SLA Compliance Note
            </div>
            <p className="leading-relaxed">
              Standard statutory turnaround for GDPR Art. 12 and state pupil privacy regulations is 30 calendar days.
              {metrics.overduePrivacyRequestsCount} simulated request is currently overdue.
            </p>
          </div>
        </div>

        {/* Retention Policy Review Horizon */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Retention Policy Review Horizons
            </h3>
            <span className="text-[10px] text-muted-foreground">{metrics.totalRetentionPolicies} Policies</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="text-lg font-bold text-rose-700 dark:text-rose-400">
                {metrics.policiesDueForReviewCount}
              </div>
              <div className="text-[10px] font-semibold text-rose-800 dark:text-rose-300">Overdue / Due Soon</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Audit required</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {Math.max(0, metrics.totalRetentionPolicies - metrics.policiesDueForReviewCount)}
              </div>
              <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">Current & Valid</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Reviewed within 1y</div>
            </div>
          </div>

          <div className="rounded-lg bg-indigo-50/60 p-2.5 text-[11px] text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-900/50">
            <span className="font-semibold text-foreground text-[10px] uppercase tracking-wider block mb-1">
              Statutory Basis Disclosure
            </span>
            <p className="leading-relaxed">
              Retention policies reflect typical educational schedules (e.g. FERPA transcripts retained 100 years,
              financial audits 7 years, safeguarding notes DOB+25 years). Actual retention requires tenant institutional review.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Cutting Governance Notice */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-semibold text-xs text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Zero-PII & Educational Privacy Safeguards Enforced
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All categories, records, and DSAR entries adhere strictly to synthetic token identifiers.
            No live student or parental data is collected, stored, or exposed in this console.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('docs')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Governance Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
