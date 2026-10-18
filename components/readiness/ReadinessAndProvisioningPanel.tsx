'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { Badge } from '@/components/ui/Badge';
import { Organization, ProvisioningStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Server,
  Terminal,
  Activity,
  Layers,
  Info,
} from 'lucide-react';

interface ReadinessAndProvisioningPanelProps {
  organization: Organization;
  onNavigateTab?: (tabId: string) => void;
}

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

  const readiness = evaluateOrganizationReadiness(organization.id);
  const simulatedEvents = getSimulatedEvents(organization.id);
  const currentStatus: ProvisioningStatus = organization.provisioningStatus || 'not_started';

  const handleRunSimulation = (forceFail = false) => {
    setIsRunning(true);
    setTimeout(() => {
      runSimulatedProvisioning(organization.id, forceFail);
      setIsRunning(false);
    }, 400);
  };

  const handleReset = () => {
    resetSimulatedProvisioning(organization.id);
  };

  const filteredItems = filterCategory === 'all'
    ? readiness.items
    : readiness.items.filter((item) => {
        if (filterCategory === 'blockers') return item.status === 'incomplete';
        if (filterCategory === 'attention') return item.status === 'attention';
        if (filterCategory === 'complete') return item.status === 'complete';
        return true;
      });

  const getStatusBadge = (status: ProvisioningStatus) => {
    switch (status) {
      case 'simulated_complete':
        return <Badge variant="success">Simulated Complete</Badge>;
      case 'simulated_in_progress':
        return <Badge variant="info">Simulated In Progress</Badge>;
      case 'ready_for_review':
        return <Badge variant="warning">Ready for Review</Badge>;
      case 'simulated_failed':
        return <Badge variant="error">Simulated Failed</Badge>;
      case 'needs_attention':
        return <Badge variant="warning">Needs Attention</Badge>;
      case 'not_started':
      default:
        return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score Card */}
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Readiness Score
            </span>
            <ShieldCheck className={`w-5 h-5 ${readiness.hasBlockers ? 'text-amber-500' : 'text-emerald-500'}`} />
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
              ? 'Blocked: Incomplete configuration items must be addressed before go-live.'
              : 'All prerequisite checks cleared for simulated go-live.'}
          </p>
        </div>

        {/* Provisioning Status Card */}
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Simulated Status
            </span>
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>{getStatusBadge(currentStatus)}</div>
          <p className="text-xs text-muted-foreground">
            Lifecycle stage of tenant partition simulation in development memory.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Activity className="w-3 h-3 text-primary" />
            <span>{simulatedEvents.length} simulated event(s) recorded</span>
          </div>
        </div>

        {/* Action Controls Card */}
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Simulation Controls
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Trigger deterministic local provisioning simulation or test error handling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => handleRunSimulation(false)}
              disabled={isRunning || readiness.hasBlockers}
              className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Simulating...' : 'Run Simulation'}
            </button>

            <button
              onClick={() => handleRunSimulation(true)}
              disabled={isRunning || readiness.hasBlockers}
              className="px-2.5 py-1.5 border border-destructive/40 text-destructive font-medium text-xs rounded-lg hover:bg-destructive/10 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Test simulated failure behavior"
            >
              Simulate Failure
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              title="Reset simulation status"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Architectural Disclaimer */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 p-4 rounded-xl flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <p className="font-bold">Transparent Demonstration Environment Contract</p>
          <p className="opacity-90">
            This workspace provides an auditable visualization of tenant configuration readiness and mock provisioning transitions.
            No live servers, database clusters, SSL certificates, or DNS zone files are manipulated. Production orchestration requires dedicated server-side workers and cloud provider adapters.
          </p>
        </div>
      </div>

      {/* Section 1: Configuration Readiness Checklist */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h4 className="font-bold text-sm text-foreground">Configuration Readiness Checklist</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audits required organizational, commercial, academic, and structural parameters.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              All ({readiness.items.length})
            </button>
            <button
              onClick={() => setFilterCategory('blockers')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'blockers' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Incomplete ({readiness.items.filter((i) => i.status === 'incomplete').length})
            </button>
            <button
              onClick={() => setFilterCategory('attention')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterCategory === 'attention' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              Attention ({readiness.items.filter((i) => i.status === 'attention').length})
            </button>
            <button
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
                    <span className="text-[10px] text-muted-foreground italic">
                      {item.isVerified ? 'Verified local record' : 'Mock demonstration attribute'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                  <p className="font-mono text-[11px] text-foreground font-medium pt-0.5">{item.reason}</p>
                </div>
              </div>

              {item.actionLabel && onNavigateTab && item.targetTab && (
                <button
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

      {/* Section 2: Simulated Provisioning Event Log */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Simulated Provisioning Event Log</h4>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Deterministic Local History
          </span>
        </div>

        {simulatedEvents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg text-xs space-y-2">
            <Layers className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <p className="font-medium text-foreground">No Provisioning Events Recorded</p>
            <p className="max-w-md mx-auto text-muted-foreground">
              Run the provisioning simulation above to execute and log deterministic demonstration events for this school organization.
            </p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {simulatedEvents.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="p-3 rounded-lg bg-muted/40 border border-border/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        evt.status === 'succeeded'
                          ? 'bg-emerald-500'
                          : evt.status === 'failed'
                          ? 'bg-destructive'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-bold text-foreground">{evt.stepName}</span>
                    <span className="text-[10px] text-muted-foreground">[{evt.stepKey}]</span>
                  </div>
                  <p className="text-muted-foreground pl-4">{evt.message}</p>
                </div>

                <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                  <Badge
                    variant={evt.status === 'succeeded' ? 'success' : evt.status === 'failed' ? 'error' : 'warning'}
                  >
                    {evt.status}
                  </Badge>
                  <p className="mt-1">{formatDate(evt.timestamp, true)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
