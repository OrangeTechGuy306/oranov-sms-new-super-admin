'use client';

import React, { useState } from 'react';
import {
  Search,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { GovernanceAuditRecord } from '@/lib/types/data-governance';

interface GovernanceAuditTabProps {
  auditLogs: GovernanceAuditRecord[];
}

export function GovernanceAuditTab({ auditLogs }: GovernanceAuditTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<GovernanceAuditRecord | null>(null);

  // Filter logs
  const filteredLogs = auditLogs.filter((l) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchAction = l.action.toLowerCase().includes(q);
      const matchTarget = (l.targetName && l.targetName.toLowerCase().includes(q)) || false;
      const matchActor = l.actor.name.toLowerCase().includes(q);
      const matchDetails = l.details.toLowerCase().includes(q);
      if (!matchAction && !matchTarget && !matchActor && !matchDetails) return false;
    }

    if (selectedAction !== 'all' && l.action !== selectedAction) {
      return false;
    }

    if (selectedSeverity !== 'all' && l.severity !== selectedSeverity) {
      return false;
    }

    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            WARNING
          </span>
        );
      case 'info':
      default:
        return (
          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            INFO
          </span>
        );
    }
  };

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action))).sort();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Platform Data Governance Audit Trail
          </h2>
          <p className="text-xs text-muted-foreground">
            Immutable log of all data classification changes, retention reviews, DSAR transitions, and lifecycle updates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Structured Log Schema Enforced
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, actor, target entity, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Audit Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No governance audit events match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(l)}
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {new Date(l.timestamp).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {l.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(l.severity)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-foreground text-[11px]">{l.actor.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {l.actor.role}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-foreground text-[11px]">
                        {l.targetName || l.targetId}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {l.targetEntity}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">
                        {l.details}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-muted/30 p-2.5 px-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Showing {filteredLogs.length} of {auditLogs.length} governance events</span>
          <span>Local demonstrative audit store • Production requires append-only WORM storage</span>
        </div>
      </div>

      {/* Detail Modal for Selected Event */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedLog.action}
                </span>
                <h2 className="text-base font-bold text-foreground">Governance Audit Event</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Timestamp
                </div>
                <div className="font-mono font-medium text-foreground mt-0.5">
                  {new Date(selectedLog.timestamp).toISOString()}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Event Details
                </div>
                <p className="text-muted-foreground leading-relaxed mt-0.5">{selectedLog.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Actor
                  </div>
                  <div className="font-semibold text-foreground mt-0.5">{selectedLog.actor.name}</div>
                  <div className="text-[10px] text-muted-foreground">{selectedLog.actor.email}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Target
                  </div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {selectedLog.targetName || selectedLog.targetId}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{selectedLog.targetEntity}</div>
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="border-t border-border pt-3">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    Event Metadata
                  </div>
                  <pre className="rounded-lg bg-muted p-2 font-mono text-[10px] text-foreground overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
