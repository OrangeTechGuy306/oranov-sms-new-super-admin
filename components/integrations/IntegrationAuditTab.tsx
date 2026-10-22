'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { AuditEvent } from '@/lib/types/audit-logs';
import { exportIntegrationAuditEventsToCsv } from '@/lib/integrations/exporter';
import { formatDate } from '@/lib/utils/formatters';
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface IntegrationAuditTabProps {
  auditEvents: AuditEvent[];
}

export function IntegrationAuditTab({ auditEvents }: IntegrationAuditTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Filter only integration-related audit events
  const integrationEvents = useMemo(() => {
    return auditEvents.filter(
      (e) =>
        e.category === 'integrations_governance' ||
        e.targetEntity === 'IntegrationRecord' ||
        e.targetEntity === 'ApiClientRecord' ||
        e.targetEntity === 'WebhookEndpointRecord' ||
        e.targetEntity === 'WebhookDeliveryRecord'
    );
  }, [auditEvents]);

  const filtered = useMemo(() => {
    let list = [...integrationEvents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.targetEntity.toLowerCase().includes(q) ||
          e.actor.name.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== 'all') {
      list = list.filter((e) => e.severity === severityFilter);
    }

    // Latest first
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return list;
  }, [integrationEvents, searchQuery, severityFilter]);

  const handleExportCsv = () => {
    const csvContent = exportIntegrationAuditEventsToCsv(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `integration_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Notice Banner */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-bold text-foreground text-sm">Integration Governance Audit Trail</h3>
          <p className="text-muted-foreground text-xs">
            Immutable administrative trace of provider updates, API client credential rotations, and webhook dispatch events.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-primary" />
          Export Audit CSV ({filtered.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit actions, operators, or target entities..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="info">Informational</option>
            <option value="warning">Warning / Elevated</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> audit events
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="mx-auto h-8 w-8 opacity-40 mb-2" />
            <p className="font-semibold text-foreground text-sm">No integration audit events found</p>
            <p className="text-xs mt-1">Actions performed in this workspace will append audit events automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Target Entity</th>
                  <th className="py-2.5 px-4">Outcome</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((evt) => (
                  <tr key={evt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {formatDate(evt.timestamp)}
                    </td>

                    <td className="py-3 px-4">
                      <code className="font-mono font-bold text-foreground text-[11px]">
                        {evt.action}
                      </code>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          evt.severity === 'critical'
                            ? 'error'
                            : evt.severity === 'warning'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {evt.severity}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground block">{evt.actor.name}</span>
                      <span className="text-muted-foreground text-[10px]">{evt.actor.role}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-foreground font-medium block truncate max-w-[140px]">
                        {evt.targetName || evt.targetId}
                      </span>
                      <span className="text-muted-foreground text-[10px] block truncate max-w-[140px]">
                        {evt.targetEntity}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          evt.status === 'succeeded'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {evt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground max-w-[300px]">
                      <p className="line-clamp-2 leading-relaxed">{evt.details}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
