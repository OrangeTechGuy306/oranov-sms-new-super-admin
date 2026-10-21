'use client';

import React, { useState } from 'react';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ShieldCheck, Info, ChevronDown, ChevronUp, AlertCircle, Database, Server, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function SystemHealthNotice() {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="space-y-3">
      <AlertBanner variant="notice" title="Phase E-09.14: Platform Telemetry & Operations Demonstration Environment">
        <div className="space-y-2 text-xs">
          <p>
            <strong>Operational Telemetry Notice:</strong> The services, metrics, background queues, and incident lifecycles shown below are deterministic development fixtures and local UI state models. They illustrate platform operations workflows prior to backend telemetry agent deployment (Prometheus, Datadog, CloudWatch).
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Source Transparency:
            </span>
            <span className="text-muted-foreground">
              Every operational card and metric carries an identifiable source badge. Missing telemetry is NEVER represented as zero or healthy.
            </span>
            <button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              {showLegend ? 'Hide Source Legend' : 'View Source Classification Legend'}
              {showLegend ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </AlertBanner>

      {showLegend && (
        <div className="p-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-3 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              Operational Source Classification Taxonomy (E-09.14 Non-Negotiable Rules)
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">Deterministic Reference</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" dot>Verified Codebase Evidence</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Confirmed facts established by inspecting active code in this repository (e.g. Next.js 16 app runtime, PlatformStore state).
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" dot>Demo Data — No Live Connection</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deterministic local fixtures designed for interactive verification of operations and incident workflows.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">Static Config Fixture</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Architectural constants configured within frontend scaffolding (e.g. RPO/RTO targets, plan allocations).
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="sm">Not Connected (Requires Backend)</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Telemetry and external integrations that require future backend infrastructure (e.g. ClickHouse warehouse, State SIS bridge).
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">Unverified / Stale Heartbeat</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Observation timestamps older than configured freshness thresholds (&gt;60 mins) or lacking cryptographically verified proof.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="error" size="sm">Unavailable Telemetry</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Missing metrics are rendered as Unavailable / Null. Under no circumstances are missing values disguised as 0 or healthy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
