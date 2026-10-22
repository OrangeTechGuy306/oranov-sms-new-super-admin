'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  IntegrationRecord,
  ApiClientRecord,
  WebhookEndpointRecord,
  WebhookDeliveryRecord,
  IntegrationMetricsSummary,
} from '@/lib/types/integrations';
import { formatDate } from '@/lib/utils/formatters';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Webhook,
  Activity,
  ArrowRight,
  ShieldAlert,
  Send,
  Plus,
  RotateCcw,
} from 'lucide-react';

interface IntegrationOverviewTabProps {
  metrics: IntegrationMetricsSummary;
  integrations: IntegrationRecord[];
  apiClients: ApiClientRecord[];
  endpoints: WebhookEndpointRecord[];
  deliveries: WebhookDeliveryRecord[];
  onNavigateTab: (tabId: string) => void;
  onInspectDelivery: (delivery: WebhookDeliveryRecord) => void;
  onOpenCreateClient: () => void;
  onOpenCreateEndpoint: () => void;
}

export function IntegrationOverviewTab({
  metrics,
  integrations,
  apiClients,
  endpoints,
  deliveries,
  onNavigateTab,
  onInspectDelivery,
  onOpenCreateClient,
  onOpenCreateEndpoint,
}: IntegrationOverviewTabProps) {
  const recentDeliveries = deliveries.slice(0, 5);

  const categoryLabels: Record<string, string> = {
    payment: 'Payment Gateways',
    email_sms: 'Email & SMS Messaging',
    identity_sso: 'Identity & SSO',
    video_conferencing: 'Video Classrooms',
    storage: 'Cloud Storage',
    sis_lms: 'SIS & Academic LMS',
    analytics: 'Product Telemetry',
    custom_api: 'Custom APIs',
  };

  return (
    <div className="space-y-6 text-xs">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Integrations"
          value={metrics.totalIntegrations}
          subtitle={`${metrics.enabledIntegrations} enabled`}
          icon={<Layers className="h-5 w-5" />}
          onClick={() => onNavigateTab('registry')}
          className="cursor-pointer"
        />

        <StatCard
          title="Requires Config"
          value={metrics.requiringConfigIntegrations}
          subtitle="Setup incomplete"
          badge={
            metrics.requiringConfigIntegrations > 0
              ? { label: 'Attention', variant: 'warning' }
              : { label: 'Optimal', variant: 'success' }
          }
          icon={<AlertTriangle className="h-5 w-5" />}
          onClick={() => onNavigateTab('registry')}
          className="cursor-pointer"
        />

        <StatCard
          title="API Clients"
          value={metrics.totalApiClients}
          subtitle={`${metrics.activeApiClients} active tokens`}
          icon={<KeyRound className="h-5 w-5" />}
          onClick={() => onNavigateTab('api-clients')}
          className="cursor-pointer"
        />

        <StatCard
          title="Webhook Endpoints"
          value={metrics.totalWebhookEndpoints}
          subtitle="Registered destinations"
          icon={<Webhook className="h-5 w-5" />}
          onClick={() => onNavigateTab('webhooks')}
          className="cursor-pointer"
        />

        <StatCard
          title="Failed Deliveries"
          value={metrics.failedDeliveriesCount}
          subtitle={`${metrics.retryEligibleCount} retry-eligible`}
          badge={
            metrics.failedDeliveriesCount > 0
              ? { label: 'Errors Logged', variant: 'error' }
              : { label: 'Clean', variant: 'success' }
          }
          icon={<RotateCcw className="h-5 w-5" />}
          onClick={() => onNavigateTab('delivery-logs')}
          className="cursor-pointer"
        />

        <StatCard
          title="Health Warnings"
          value={metrics.configWarningsCount}
          subtitle="Diagnostics findings"
          badge={
            metrics.configWarningsCount > 0
              ? { label: 'Review', variant: 'warning' }
              : { label: 'Healthy', variant: 'success' }
          }
          icon={<ShieldAlert className="h-5 w-5" />}
          onClick={() => onNavigateTab('health')}
          className="cursor-pointer"
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div>
          <h3 className="font-bold text-foreground text-sm">Governance Operations</h3>
          <p className="text-muted-foreground text-xs">
            Manage provider setups, register webhook receivers, and evaluate outbound delivery pipelines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreateClient}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            Register API Client
          </button>
          <button
            type="button"
            onClick={onOpenCreateEndpoint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <Webhook className="h-3.5 w-3.5 text-primary" />
            New Webhook Endpoint
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('docs')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
          >
            <Activity className="h-3.5 w-3.5" />
            Event Catalogue & Architecture
          </button>
        </div>
      </div>

      {/* 2-Column Analytics Grids */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Integration Ecosystem by Category
            </h4>
            <span className="text-muted-foreground">{metrics.totalIntegrations} registered</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(metrics.integrationsByCategory).map(([cat, count]) => {
              const pct = metrics.totalIntegrations > 0 ? Math.round((count / metrics.totalIntegrations) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{categoryLabels[cat] || cat}</span>
                    <span className="text-muted-foreground font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deliveries by Outcome */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Webhook Deliveries by Outcome
            </h4>
            <button
              type="button"
              onClick={() => onNavigateTab('delivery-logs')}
              className="text-primary hover:underline inline-flex items-center gap-1 text-[11px]"
            >
              View All Logs <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Simulated Success
              </span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.deliveriesByOutcome.simulated_success}
              </p>
              <span className="text-[10px] text-muted-foreground">HTTP 2xx Handshakes</span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Retry Scheduled
              </span>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {metrics.deliveriesByOutcome.retry_scheduled}
              </p>
              <span className="text-[10px] text-muted-foreground">In Backoff Queue</span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Exhausted Retries
              </span>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {metrics.deliveriesByOutcome.exhausted_retries}
              </p>
              <span className="text-[10px] text-muted-foreground">Dead Letter Queue</span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Retry Eligible
              </span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.deliveriesByOutcome.retry_eligible}
              </p>
              <span className="text-[10px] text-muted-foreground">Manual / Auto Triage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Delivery Activity Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Recent Simulated Deliveries
            </h4>
            <p className="text-muted-foreground text-xs">
              Live inspection of recent webhook dispatch events and responses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('delivery-logs')}
            className="text-primary hover:underline text-xs inline-flex items-center gap-1 font-semibold"
          >
            Open Delivery Logs Workspace <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Delivery ID</th>
                <th className="py-2.5 px-4">Endpoint</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Outcome</th>
                <th className="py-2.5 px-4">Duration</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentDeliveries.map((del) => (
                <tr key={del.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-foreground">
                    {del.id}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-foreground block truncate max-w-[200px]">
                      {del.endpointName}
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px] truncate max-w-[200px] block">
                      {del.destinationUrl}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-foreground">
                    {del.eventType}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        del.httpStatusCode >= 200 && del.httpStatusCode < 300
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      HTTP {del.httpStatusCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge
                      variant={
                        del.outcome === 'simulated_success'
                          ? 'success'
                          : del.outcome === 'exhausted_retries'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {del.outcome.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-muted-foreground">
                    {del.durationMs}ms
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-[11px]">
                    {formatDate(del.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectDelivery(del)}
                      className="rounded border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                    >
                      Inspect
                    </button>
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
