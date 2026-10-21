'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AuditEvent } from '@/lib/types/audit-logs';
import { formatDate } from '@/lib/utils/formatters';
import {
  Clock,
  User,
  Target,
  Layers,
  ArrowRight,
  Fingerprint,
  Info,
} from 'lucide-react';

interface AuditEventDetailModalProps {
  event: AuditEvent | null;
  onClose: () => void;
  organizationName?: string;
}

export function AuditEventDetailModal({
  event,
  onClose,
  organizationName,
}: AuditEventDetailModalProps) {
  if (!event) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Audit Record Inspection — ${event.id}`}
      size="lg"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Top Badges & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                event.severity === 'critical'
                  ? 'error'
                  : event.severity === 'warning'
                  ? 'warning'
                  : 'neutral'
              }
              size="sm"
            >
              {event.severity.toUpperCase()}
            </Badge>

            <Badge
              variant={
                event.status === 'succeeded'
                  ? 'success'
                  : event.status === 'failed'
                  ? 'error'
                  : 'warning'
              }
              size="sm"
            >
              {event.status.toUpperCase()}
            </Badge>

            <span className="text-[11px] font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
              {event.category.replace(/_/g, ' ')}
            </span>

            {event.isDemoFixture && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Simulated Fixture
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(event.timestamp, true)}</span>
          </div>
        </div>

        {/* Action Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Administrative Action Key
          </span>
          <p className="text-sm font-mono font-extrabold text-foreground p-2.5 rounded-lg bg-card border border-border">
            {event.action}
          </p>
        </div>

        {/* Actor and Target Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Actor Card */}
          <div className="p-3 bg-card rounded-xl border border-border space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Actor Provenance</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">Identity: </span>
                <span className="font-semibold text-foreground">{event.actor.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-mono text-muted-foreground text-[11px]">{event.actor.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Platform Role: </span>
                <span className="font-mono font-semibold text-foreground">{event.actor.role}</span>
              </div>
              {event.actor.ipAddress && (
                <div>
                  <span className="text-muted-foreground">Source IP: </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{event.actor.ipAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Target Entity Card */}
          <div className="p-3 bg-card rounded-xl border border-border space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
              <Target className="w-3.5 h-3.5 text-purple-500" />
              <span>Target Resource</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">Entity Type: </span>
                <span className="font-semibold text-foreground">{event.targetEntity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Target Identifier: </span>
                <span className="font-mono text-[11px] text-foreground">{event.targetId}</span>
              </div>
              {event.targetName && (
                <div>
                  <span className="text-muted-foreground">Resource Label: </span>
                  <span className="font-medium text-foreground">{event.targetName}</span>
                </div>
              )}
              {event.organizationId && (
                <div>
                  <span className="text-muted-foreground">Tenant Organization: </span>
                  <span className="font-medium text-foreground">
                    {organizationName || event.organizationId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Narrative Details */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Event Narrative & Justification
          </span>
          <div className="p-3 bg-muted/20 border border-border rounded-lg text-foreground leading-relaxed">
            {event.details}
          </div>
        </div>

        {/* State Mutation Diff */}
        {event.diff && event.diff.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Layers className="w-3 h-3" />
              State Mutation Diff
            </span>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-1.5 px-3">Field</th>
                    <th className="py-1.5 px-3">Previous State</th>
                    <th className="py-1.5 px-3"></th>
                    <th className="py-1.5 px-3">New State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {event.diff.map((item, idx) => (
                    <tr key={idx} className="bg-card">
                      <td className="py-1.5 px-3 font-mono font-semibold text-foreground">
                        {item.field}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-rose-600 dark:text-rose-400">
                        {item.previousValue !== null ? String(item.previousValue) : '<null>'}
                      </td>
                      <td className="py-1.5 px-1 text-muted-foreground">
                        <ArrowRight className="w-3 h-3" />
                      </td>
                      <td className="py-1.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {item.newValue !== null ? String(item.newValue) : '<null>'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Provenance & Correlation */}
        <div className="p-2.5 bg-muted/40 rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Fingerprint className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>Correlation ID: </span>
            <span className="font-mono text-foreground font-semibold">
              {event.correlationId || 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Classification: </span>
            <span className="font-mono text-foreground">
              {event.sourceClassification || 'client_simulation'}
            </span>
          </div>
        </div>

        {/* Contextual Metadata JSON */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Contextual Metadata Payload
            </span>
            <pre className="p-3 bg-muted rounded-lg font-mono text-[11px] overflow-x-auto text-foreground border border-border max-h-36">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Privacy Invariant Banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Data Minimization Standard:</strong> In compliance with FERPA/GDPR safeguards, platform audit records exclude raw passwords, authentication tokens, and individual student personal data.
          </span>
        </div>
      </div>
    </Modal>
  );
}
