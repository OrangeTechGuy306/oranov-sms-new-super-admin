'use client';

import React, { useState } from 'react';
import { BackgroundJobStatus, ExternalIntegrationRecord } from '@/lib/system-health/types';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  Pause,
  Key,
  ShieldCheck,
  AlertOctagon,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface BackgroundJobsAndIntegrationsWorkspaceProps {
  backgroundJobs: BackgroundJobStatus[];
  externalIntegrations: ExternalIntegrationRecord[];
}

export function BackgroundJobsAndIntegrationsWorkspace({
  backgroundJobs,
  externalIntegrations,
}: BackgroundJobsAndIntegrationsWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'integrations'>('jobs');
  const [selectedIntegration, setSelectedIntegration] = useState<ExternalIntegrationRecord | null>(null);

  const runningJobsCount = backgroundJobs.filter((j) => j.status === 'running').length;
  const failingJobsCount = backgroundJobs.filter((j) => j.status === 'failing').length;
  const totalPendingQueue = backgroundJobs.reduce((acc, j) => acc + j.pendingCount, 0);

  const connectedIntegrationsCount = externalIntegrations.filter((i) => i.connectionStatus === 'connected').length;
  const degradedIntegrationsCount = externalIntegrations.filter((i) => i.connectionStatus === 'degraded').length;

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="info" size="sm" dot>PROCESSING</Badge>;
      case 'idle':
        return <Badge variant="success" size="sm">IDLE (DRAINED)</Badge>;
      case 'failing':
        return <Badge variant="error" size="sm" dot>FAILING JOBS</Badge>;
      case 'paused':
        return <Badge variant="warning" size="sm">PAUSED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status.toUpperCase()}</Badge>;
    }
  };

  const getIntegrationStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" size="sm" dot>CONNECTED</Badge>;
      case 'degraded':
        return <Badge variant="warning" size="sm" dot>DEGRADED</Badge>;
      case 'disconnected':
        return <Badge variant="error" size="sm">DISCONNECTED</Badge>;
      case 'not_configured':
        return <Badge variant="neutral" size="sm">NOT CONFIGURED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="info" size="md">Operations Scaffolding</Badge>
          <p className="text-muted-foreground">
            Displaying asynchronous BullMQ job queues and third-party SaaS integration gateways. No external credentials are stored or tested live in this frontend demo.
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
          Source: Deterministic Scaffolding
        </span>
      </div>

      {/* Subtab Toggle */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('jobs')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              activeSubTab === 'jobs'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Async Background Workers ({backgroundJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('integrations')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              activeSubTab === 'integrations'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            External Integration Gateways ({externalIntegrations.length})
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
          {activeSubTab === 'jobs' ? `Pending Queue Backlog: ${totalPendingQueue} jobs` : `${connectedIntegrationsCount} Connected Gateways`}
        </span>
      </div>

      {/* SUBTAB 1: BACKGROUND JOBS */}
      {activeSubTab === 'jobs' ? (
        <div className="space-y-6">
          {/* Queue Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              title="Active Queues"
              value={backgroundJobs.length}
              subtitle="Registered processors"
              icon={<Cpu className="w-4 h-4 text-primary" />}
            />
            <StatCard
              title="Processing Jobs"
              value={runningJobsCount}
              subtitle="Worker threads active"
              icon={<Play className="w-4 h-4 text-emerald-500" />}
            />
            <StatCard
              title="Pending Backlog"
              value={totalPendingQueue}
              subtitle="Queued for drain"
              icon={<Clock className="w-4 h-4 text-amber-500" />}
            />
            <StatCard
              title="Failing Queues"
              value={failingJobsCount}
              subtitle="Requires triage"
              icon={<AlertOctagon className={`w-4 h-4 ${failingJobsCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />}
            />
          </div>

          {/* Job Queues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {backgroundJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-foreground text-xs">{job.jobType}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      queue: <code className="bg-muted px-1 rounded">{job.queueName}</code>
                    </span>
                  </div>
                  {getJobStatusBadge(job.status)}
                </div>

                {job.failureSummary && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-800 dark:text-rose-300">
                    <strong>Worker Error:</strong> {job.failureSummary}
                  </div>
                )}

                {/* Queue Counts Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50 text-center font-mono">
                  <div className="p-1.5 rounded bg-muted/40">
                    <span className="text-[9px] text-muted-foreground uppercase block">Pending</span>
                    <span className="font-bold text-foreground text-xs">{job.pendingCount}</span>
                  </div>
                  <div className="p-1.5 rounded bg-muted/40">
                    <span className="text-[9px] text-muted-foreground uppercase block">Active</span>
                    <span className="font-bold text-primary text-xs">{job.runningCount}</span>
                  </div>
                  <div className="p-1.5 rounded bg-muted/40">
                    <span className="text-[9px] text-muted-foreground uppercase block">Done (24h)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{job.completed24hCount}</span>
                  </div>
                  <div className="p-1.5 rounded bg-muted/40">
                    <span className="text-[9px] text-muted-foreground uppercase block">Failed (24h)</span>
                    <span className={`font-bold text-xs ${job.failed24hCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                      {job.failed24hCount}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                  <span>Last Exec: {formatDate(job.lastExecutionTime, true)}</span>
                  <span>Avg Duration: {job.avgDurationSeconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SUBTAB 2: EXTERNAL INTEGRATIONS */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalIntegrations.map((integ) => (
              <div
                key={integ.id}
                className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3 text-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-foreground text-xs">{integ.name}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono">{integ.provider}</span>
                    </div>
                    {getIntegrationStatusBadge(integ.connectionStatus)}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {integ.purpose}
                  </p>

                  {integ.lastErrorSummary && (
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[10px] text-amber-800 dark:text-amber-300">
                      <strong>Downstream Notice:</strong> {integ.lastErrorSummary}
                    </div>
                  )}

                  {/* Required Configuration Checklist */}
                  <div className="space-y-1 pt-2 border-t border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Required Configuration Keys
                    </span>
                    <div className="space-y-1">
                      {integ.requiredConfigurationItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-foreground">{item.name}</span>
                          {item.isConfigured ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {item.isSecret ? '••••••••' : 'SET'}
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              MISSING
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Last Synced: {integ.lastSyncTime ? formatDate(integ.lastSyncTime, true) : 'Never'}
                  </span>
                  <p className="text-[10px] text-muted-foreground italic leading-tight">
                    {integ.connectionLimitations}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
