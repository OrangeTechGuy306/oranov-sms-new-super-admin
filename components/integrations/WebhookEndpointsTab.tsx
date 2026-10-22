'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { WebhookEndpointRecord } from '@/lib/types/integrations';
import { filterWebhookEndpoints } from '@/lib/integrations/evaluator';
import { formatDate } from '@/lib/utils/formatters';
import {
  Webhook,
  Plus,
  Search,
  Send,
  Sliders,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';

interface WebhookEndpointsTabProps {
  endpoints: WebhookEndpointRecord[];
  onOpenCreate: () => void;
  onOpenEdit: (endpoint: WebhookEndpointRecord) => void;
  onOpenTest: (endpoint: WebhookEndpointRecord) => void;
  onToggleEnabled: (id: string) => void;
  onViewLogs: (endpointId: string) => void;
}

export function WebhookEndpointsTab({
  endpoints,
  onOpenCreate,
  onOpenEdit,
  onOpenTest,
  onToggleEnabled,
  onViewLogs,
}: WebhookEndpointsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('all');

  const filtered = useMemo(() => {
    return filterWebhookEndpoints(endpoints, searchQuery, enabledFilter);
  }, [endpoints, searchQuery, enabledFilter]);

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return <span className="text-muted-foreground text-[10px]">No dispatches</span>;
    switch (outcome) {
      case 'simulated_success':
        return <Badge variant="success">Success</Badge>;
      case 'retry_scheduled':
      case 'retry_eligible':
        return <Badge variant="warning">Retry Scheduled</Badge>;
      case 'exhausted_retries':
        return <Badge variant="error">Dead Letter</Badge>;
      default:
        return <Badge variant="neutral">{outcome}</Badge>;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="space-y-0.5">
          <h3 className="font-bold text-foreground text-sm">Webhook Destination Endpoints</h3>
          <p className="text-muted-foreground text-xs">
            Manage customer and integration webhook receiver URLs, event subscriptions, retry policies, and test dispatches.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
        >
          <Plus className="h-4 w-4" />
          Register Webhook Endpoint
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by endpoint name, destination URL, or description..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <select
            value={enabledFilter}
            onChange={(e) => setEnabledFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All States</option>
            <option value="enabled">Active / Enabled Only</option>
            <option value="disabled">Paused / Disabled Only</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {endpoints.length} endpoints
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Endpoint & URL</th>
                <th className="py-2.5 px-4">Subscribed Events</th>
                <th className="py-2.5 px-4">Delivery Policy</th>
                <th className="py-2.5 px-4">Signing Secret</th>
                <th className="py-2.5 px-4">State</th>
                <th className="py-2.5 px-4">Last Delivery</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ep) => (
                <tr key={ep.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="space-y-0.5 max-w-[260px]">
                      <span className="font-bold text-foreground block truncate">{ep.name}</span>
                      <code className="font-mono text-[11px] text-muted-foreground block truncate">
                        {ep.destinationUrl}
                      </code>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1 max-w-[220px]">
                      <span className="font-semibold text-foreground">
                        {ep.subscribedEvents.length} events
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ep.subscribedEvents.slice(0, 2).map((ev) => (
                          <span
                            key={ev}
                            className="rounded bg-muted px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground truncate max-w-[100px]"
                          >
                            {ev}
                          </span>
                        ))}
                        {ep.subscribedEvents.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">
                            +{ep.subscribedEvents.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5 text-[11px] text-muted-foreground">
                      <span>Timeout: <strong className="text-foreground">{ep.timeoutMs}ms</strong></span>
                      <span className="block">Max retries: <strong className="text-foreground">{ep.retryPolicy.maxRetries}x</strong></span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {ep.signingSecretMasked}
                    </code>
                  </td>

                  <td className="py-3 px-4">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={ep.isEnabled}
                        onChange={() => onToggleEnabled(ep.id)}
                        className="peer sr-only"
                      />
                      <div className="peer h-4 w-7 rounded-full bg-muted-foreground/30 after:absolute after:left-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-hidden" />
                    </label>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {getOutcomeBadge(ep.lastDeliveryOutcome)}
                      {ep.lastDeliveryAt && (
                        <span className="block text-[10px] text-muted-foreground">
                          {formatDate(ep.lastDeliveryAt)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenTest(ep)}
                        title="Simulate test webhook dispatch"
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Send className="h-3 w-3 text-primary" />
                        Test
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewLogs(ep.id)}
                        title="View delivery attempt logs for this endpoint"
                        className="rounded border border-border p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEdit(ep)}
                        title="Edit endpoint parameters"
                        className="rounded border border-border p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
