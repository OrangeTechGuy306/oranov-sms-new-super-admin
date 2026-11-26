'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { Badge } from '@/components/ui/Badge';
import { Organization, ProvisioningStatus } from '@/lib/types';
import type { ProvisioningStageKey } from '@/lib/provisioning/simulator';
import { formatDate } from '@/lib/utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Terminal,
  Activity,
  Layers,
  Info,
  ClipboardCheck,
  RefreshCw,
} from 'lucide-react';

interface ReadinessAndProvisioningPanelProps {
  organization: Organization;
  onNavigateTab?: (tabId: string) => void;
}

const FAILURE_STAGE_OPTIONS: Array<{ key: ProvisioningStageKey; label: string }> = [
  { key: 'registration_accepted', label: '1. Registration Accepted' },
  { key: 'profile_prepared', label: '2. Profile Prepared' },
  { key: 'initial_campus_prepared', label: '3. Initial Campus Prepared' },
  { key: 'institution_structure_configured', label: '4. Institution Structure Configured' },
  { key: 'subscription_assigned', label: '5. Subscription Assigned' },
  { key: 'entitlements_prepared', label: '6. Module Entitlements Prepared' },
  { key: 'initial_administrator_configured', label: '7. Initial Administrator Configured' },
  { key: 'ready_for_activation', label: '8. Marked Ready for Activation' },
];

export function ReadinessAndProvisioningPanel({
  organization,
  onNavigateTab,
}: ReadinessAndProvisioningPanelProps) {
  const {
    evaluateOrganizationReadiness,
    runSimulatedProvisioning,
    resetSimulatedProvisioning,
    getSimulatedEvents,
  } = usePlatformStore();

  const [isRunning, setIsRunning] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [failStageKey, setFailStageKey] = useState<ProvisioningStageKey>('subscription_assigned');
  const [attemptCount, setAttemptCount] = useState(1);

  const readiness = evaluateOrganizationReadiness(organization.id);
  const simulatedEvents = getSimulatedEvents(organization.id);
  const currentStatus: ProvisioningStatus = organization.provisioningStatus || 'not_started';

  const handleRunSimulation = (opts?: {
    forceFail?: boolean;
    markForManualReview?: boolean;
    isRetry?: boolean;
  }) => {
    setIsRunning(true);
    const nextAttempt = opts?.isRetry ? attemptCount + 1 : attemptCount;
    if (opts?.isRetry) setAttemptCount(nextAttempt);

    setTimeout(() => {
      runSimulatedProvisioning(organization.id, {
        forceFail: Boolean(opts?.forceFail),
        forceFailStageKey: failStageKey,
        markForManualReview: Boolean(opts?.markForManualReview),
        attempt: nextAttempt,
      });
      setIsRunning(false);
    }, 300);
  };

  const handleReset = () => {
    setAttemptCount(1);
    resetSimulatedProvisioning(organization.id);
  };

  const filteredItems =
    filterCategory === 'all'
      ? readiness.items
      : readiness.items.filter((item) => {
          if (filterCategory === 'blockers') return item.status === 'incomplete';
          if (filterCategory === 'attention') return item.status === 'attention';
          if (filterCategory === 'complete') return item.status === 'complete';
          return true;
        });

  const failedEvent = simulatedEvents.find((e) => e.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Overview Top Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Readiness Score Card */}
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Readiness Assessment
            </span>
            <ShieldCheck
              className={`w-5 h-5 ${readiness.hasBlockers ? 'text-amber-500' : 'text-emerald-500'}`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{readiness.score}%</span>
            <span className="text-xs text-muted-foreground">
              ({readiness.completedCount} of {readiness.totalCount} complete)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                readiness.score === 100
                  ? 'bg-emerald-500'
                  : readiness.score >= 70
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${readiness.score}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {readiness.hasBlockers
              ? 'Blocked: Unresolved readiness items must be completed before tenant activation.'
              : 'All mandatory readiness prerequisites passed for simulated tenant preparation.'}
          </p>
        </div>

        {/* Provisioning Status Card */}
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Preparation Workflow Status
            </span>
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge status={currentStatus} dot size="md" />
            {currentStatus === 'ready_for_review' && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                Manual review state
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Client-side business workflow state tracking preparation stages from registration acceptance through activation readiness.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Activity className="w-3 h-3 text-primary" />
            <span>{simulatedEvents.length} stage event(s) • Attempt #{attemptCount}</span>
          </div>
        </div>

        {/* Action Controls Card */}
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Provisioning Simulation Controls
            </span>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground block">
                Failure Test Stage (for negative recovery drills)
              </label>
              <select
                value={failStageKey}
                onChange={(e) => setFailStageKey(e.target.value as ProvisioningStageKey)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                {FAILURE_STAGE_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleRunSimulation({ forceFail: false })}
              disabled={isRunning || readiness.hasBlockers}
              className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Simulating...' : 'Run 8-Stage Prep'}
            </button>

            {(currentStatus === 'simulated_failed' || currentStatus === 'needs_attention') && (
              <button
                type="button"
                onClick={() => handleRunSimulation({ forceFail: false, isRetry: true })}
                disabled={isRunning || readiness.hasBlockers}
                className="px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Simulation
              </button>
            )}

            <button
              type="button"
              onClick={() => handleRunSimulation({ markForManualReview: true })}
              disabled={isRunning || readiness.hasBlockers}
              className="px-2.5 py-1.5 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-medium text-xs rounded-lg hover:bg-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              Flag Manual Review
            </button>

            <button
              type="button"
              onClick={handleRunSimulation.bind(null, { forceFail: true })}
              disabled={isRunning || readiness.hasBlockers}
              className="px-2.5 py-1.5 border border-destructive/40 text-destructive font-medium text-xs rounded-lg hover:bg-destructive/10 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              Simulate Failure
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              title="Reset simulation status"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Failed Stage Highlight Callout */}
      {failedEvent && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-900 dark:text-rose-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Failed Preparation Stage: {failedEvent.stepName}</p>
              <p>{failedEvent.warningOrError || failedEvent.message}</p>
            </div>
          </div>
          {!readiness.hasBlockers && (
            <button
              type="button"
              onClick={() => handleRunSimulation({ forceFail: false, isRetry: true })}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shrink-0 cursor-pointer"
            >
              Retry After Remediation
            </button>
          )}
        </div>
      )}

      {/* Honest Frontend Simulation Boundary Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 p-4 rounded-xl flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <p className="font-bold">Frontend Workflow Simulation Contract (No Infrastructure Side Effects)</p>
          <p className="opacity-90">
            This panel validates tenant business readiness, plan assignments, and canonical P0-4 module preparation locally in browser state.
            No database schemas, isolated storage partitions, DNS zone changes, TLS certificates, server containers, or welcome emails are created or dispatched.
          </p>
        </div>
      </div>

      {/* Section 1: Configuration Readiness Checklist */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h4 className="font-bold text-sm text-foreground">Configuration Readiness Checklist</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audits organizational identity, campus structure, commercial subscription, and workspace configuration prerequisites.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              All ({readiness.items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('blockers')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'blockers' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Incomplete ({readiness.items.filter((i) => i.status === 'incomplete').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('attention')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'attention' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              Attention ({readiness.items.filter((i) => i.status === 'attention').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('complete')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'complete' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              Complete ({readiness.completedCount})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                item.status === 'complete'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : item.status === 'incomplete'
                  ? 'bg-destructive/5 border-destructive/20'
                  : item.status === 'attention'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : item.status === 'incomplete' ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : item.status === 'attention' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground">{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                  <p className="font-mono text-[11px] text-foreground font-medium pt-0.5">{item.reason}</p>
                </div>
              </div>

              {item.actionLabel && onNavigateTab && item.targetTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab(item.targetTab!)}
                  className="px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground font-semibold rounded-lg shrink-0 cursor-pointer text-xs"
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Simulated Provisioning Stages & Event Details */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">
              Simulated Tenant Preparation Stages (8-Stage Workflow)
            </h4>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Deterministic Frontend Log
          </span>
        </div>

        {simulatedEvents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg text-xs space-y-2">
            <Layers className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <p className="font-medium text-foreground">No Preparation Stages Executed Yet</p>
            <p className="max-w-md mx-auto text-muted-foreground">
              Run the 8-stage preparation workflow above to inspect stage-by-stage validation results, warnings, and activation readiness.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            {simulatedEvents.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  evt.status === 'failed'
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : evt.status === 'warning' || evt.status === 'pending_review'
                    ? 'bg-amber-500/5 border-amber-500/25'
                    : 'bg-muted/35 border-border/80'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        evt.status === 'succeeded'
                          ? 'bg-emerald-500'
                          : evt.status === 'failed'
                          ? 'bg-rose-500'
                          : evt.status === 'skipped'
                          ? 'bg-slate-400'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-bold text-foreground">{evt.stepName}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">[{evt.stepKey}]</span>
                    {evt.validationResult && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border font-mono">
                        validation: {evt.validationResult}
                      </span>
                    )}
                  </div>
                  {evt.description && (
                    <p className="text-muted-foreground pl-4">{evt.description}</p>
                  )}
                  <p className="text-foreground pl-4 font-mono text-[11px]">{evt.message}</p>
                  {evt.warningOrError && (
                    <p className="pl-4 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      Notice: {evt.warningOrError}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                  <Badge
                    variant={
                      evt.status === 'succeeded'
                        ? 'success'
                        : evt.status === 'failed'
                        ? 'error'
                        : evt.status === 'skipped'
                        ? 'neutral'
                        : 'warning'
                    }
                  >
                    {evt.status.replace(/_/g, ' ')}
                  </Badge>
                  <p className="mt-1 font-mono">{formatDate(evt.timestamp, true)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
