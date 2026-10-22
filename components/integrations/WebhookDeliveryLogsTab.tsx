'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  WebhookDeliveryRecord,
  WebhookEndpointRecord,
} from '@/lib/types/integrations';
import {
  filterWebhookDeliveries,
  canRetryDelivery,
} from '@/lib/integrations/evaluator';
import { exportWebhookDeliveriesToCsv } from '@/lib/integrations/exporter';
import { formatDate } from '@/lib/utils/formatters';
import {
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Eye,
  Filter,
} from 'lucide-react';

interface WebhookDeliveryLogsTabProps {
  deliveries: WebhookDeliveryRecord[];
  endpoints: WebhookEndpointRecord[];
  onInspectDelivery: (delivery: WebhookDeliveryRecord) => void;
  onRetryDelivery: (deliveryId: string, simulateSuccess?: boolean) => void;
  initialEndpointFilter?: string;
}

export function WebhookDeliveryLogsTab({
  deliveries,
  endpoints,
  onInspectDelivery,
  onRetryDelivery,
  initialEndpointFilter = 'all',
}: WebhookDeliveryLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [endpointFilter, setEndpointFilter] = useState(initialEndpointFilter);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  const filtered = useMemo(() => {
    return filterWebhookDeliveries(deliveries, searchQuery, endpointFilter, eventTypeFilter, outcomeFilter);
  }, [deliveries, searchQuery, endpointFilter, eventTypeFilter, outcomeFilter]);

  const handleExportCsv = () => {
    const csvContent = exportWebhookDeliveriesToCsv(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `webhook_delivery_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'simulated_success':
        return <Badge variant="success">Success</Badge>;
      case 'retry_scheduled':
        return <Badge variant="warning">Retry Scheduled</Badge>;
      case 'retry_eligible':
        return <Badge variant="info">Retry Eligible</Badge>;
      case 'exhausted_retries':
        return <Badge variant="error">Dead Letter</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{outcome}</Badge>;
    }
  };

  // Distinct event types in dataset
  const uniqueEventTypes = useMemo(() => {
    const set = new Set<string>();
    for (const d of deliveries) {
      set.add(d.eventType);
    }
    return Array.from(set);
  }, [deliveries]);

  return (
    <div className="space-y-4 text-xs">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by delivery ID, destination URL, or event..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <select
            value={endpointFilter}
            onChange={(e) => setEndpointFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Endpoints</option>
            {endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.name}
              </option>
            ))}
          </select>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Event Types</option>
            {uniqueEventTypes.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Outcomes</option>
            <option value="simulated_success">Success (HTTP 2xx)</option>
            <option value="retry_scheduled">Retry Scheduled</option>
            <option value="retry_eligible">Retry Eligible</option>
            <option value="exhausted_retries">Exhausted (Dead Letter)</option>
            <option value="simulated_failure">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            Export CSV ({filtered.length})
          </button>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <History className="mx-auto h-8 w-8 opacity-40 mb-2" />
            <p className="font-semibold text-foreground text-sm">No delivery logs match filter criteria</p>
            <p className="text-xs mt-1">Adjust search parameters or emit a test delivery simulation.</p>
          </div>
        ) : (
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
                  <th className="py-2.5 px-4">Attempts</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((del) => {
                  const retry = canRetryDelivery(del);
                  return (
                    <tr key={del.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onInspectDelivery(del)}
                          className="font-mono font-bold text-primary hover:underline text-xs"
                        >
                          {del.id}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <span className="font-medium text-foreground block truncate">
                            {del.endpointName}
                          </span>
                          <code className="text-muted-foreground text-[10px] block truncate">
                            {del.destinationUrl}
                          </code>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-foreground">
                        {del.eventType}
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4">{getOutcomeBadge(del.outcome)}</td>

                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {del.durationMs}ms
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        <span className="font-medium text-foreground">{del.currentAttempt}</span> of {del.maxAttempts}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        {formatDate(del.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {retry.eligible && (
                            <button
                              type="button"
                              onClick={() => onRetryDelivery(del.id, true)}
                              title="Simulate immediate retry attempt"
                              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                            >
                              <RotateCcw className="h-3 w-3 text-primary" />
                              Retry
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onInspectDelivery(del)}
                            className="rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
