'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { formatDate } from '@/lib/utils/formatters';
import {
  Activity,
  CheckCircle2,
  Server,
  Database,
  Mail,
  ShieldCheck,
  Radio,
  RefreshCw,
} from 'lucide-react';

export default function SystemHealthPage() {
  const { systemServices, incidents } = usePlatformStore();
  const [lastRefreshed, setLastRefreshed] = useState<string>('2026-03-17T09:30:00Z');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date().toISOString());
      setIsRefreshing(false);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 3000);
    }, 400);
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'core_application':
        return <Server className="w-4 h-4 text-primary" />;
      case 'database_storage':
        return <Database className="w-4 h-4 text-emerald-500" />;
      case 'external_integration':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'security_auth':
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Operational Visibility & System Health"
        description="High-level operational health indicators across platform routing, multi-tenant databases, external gateways, and async workers."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Polling Mock Baseline...' : 'Refresh Telemetry Baseline'}
          </button>
        }
      />

      {refreshToast && (
        <AlertBanner variant="info" title="Telemetry Refreshed">
          Simulated telemetry baseline updated against development storage. Next poll interval in 60s.
        </AlertBanner>
      )}

      <AlertBanner variant="notice" title="Demonstration Operational Model (Non-Production)">
        <strong>Notice regarding telemetry integration:</strong> The services and metrics below are static development demonstration fixtures. They do not represent live production ping tests, real database replication latency, or actual Mailgun/Stripe API availability. Live telemetry will be powered by backend Prometheus, Datadog, and AWS CloudWatch integrations in production.
      </AlertBanner>

      {/* Global Status Banner */}
      <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
              All Core SaaS Services Operational (Demo Fixture)
            </h2>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
              7 of 7 platform components reporting normal development baseline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge variant="success" size="md" dot>
            Normal Operations
          </Badge>
          <span className="text-[11px] font-mono text-muted-foreground">
            Updated: {formatDate(lastRefreshed, true)}
          </span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Platform Architecture Components
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    {getServiceIcon(svc.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground">{svc.name}</h4>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {svc.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <Badge variant="success" size="sm" dot>
                  Operational
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {svc.description}
              </p>

              <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-muted-foreground">Uptime Estimate:</span>
                  <p className="font-semibold text-foreground">{svc.uptimeEstimate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ping Latency:</span>
                  <p className="font-semibold text-foreground">{svc.latencyEstimate}</p>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-muted-foreground flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">Dependencies:</span>
                {svc.dependencies.map((dep, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Incident History */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
        <div className="border-b border-border/50 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Recent Operational Notices & Incidents</h3>
            <p className="text-xs text-muted-foreground">Historical service notices and maintenance logs.</p>
          </div>
          <Badge variant="neutral" size="sm">
            {incidents.length} Resolved Record
          </Badge>
        </div>

        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold text-foreground text-sm">{inc.title}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span>Created: {formatDate(inc.createdAt, true)}</span>
                  <span>•</span>
                  <Badge variant="success" size="sm">Resolved</Badge>
                </div>
              </div>

              <p className="text-muted-foreground">{inc.description}</p>

              {/* Updates timeline */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Incident Updates Timeline
                </span>
                <div className="border-l-2 border-border pl-3 space-y-2.5 ml-1">
                  {inc.updates.map((update, idx) => (
                    <div key={idx} className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{update.author}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(update.timestamp, true)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
