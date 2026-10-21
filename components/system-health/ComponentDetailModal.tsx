'use client';

import React from 'react';
import Link from 'next/link';
import { OperationalComponent, PlatformIncident, MaintenanceWindow } from '@/lib/system-health/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  getComponentStatusBadge,
  getSourceClassificationBadge,
} from '@/lib/system-health/evaluator';
import {
  Server,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Wrench,
  FileText,
  ExternalLink,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface ComponentDetailModalProps {
  component: OperationalComponent | null;
  onClose: () => void;
  incidents: PlatformIncident[];
  maintenanceWindows: MaintenanceWindow[];
  onSelectIncident?: (incident: PlatformIncident) => void;
}

export function ComponentDetailModal({
  component,
  onClose,
  incidents,
  maintenanceWindows,
  onSelectIncident,
}: ComponentDetailModalProps) {
  if (!component) return null;

  const statusBadge = getComponentStatusBadge(component.status);
  const sourceBadge = getSourceClassificationBadge(component.statusSource);

  // Find incidents affecting this component
  const relatedIncidents = incidents.filter((inc) =>
    inc.affectedComponents.includes(component.id)
  );

  // Find maintenance windows affecting this component
  const relatedMaintenance = maintenanceWindows.filter((win) =>
    win.affectedComponents.includes(component.id)
  );

  return (
    <Modal
      isOpen={!!component}
      onClose={onClose}
      title={component.name}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Link
            href={`/audit-logs?searchQuery=${encodeURIComponent(component.name)}`}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
          >
            <FileText className="w-3.5 h-3.5" />
            View Audit Logs for this Component
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            Close Drawer
          </button>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusBadge.variant} size="md" dot>
                {statusBadge.label}
              </Badge>
              <Badge variant={sourceBadge.variant} size="sm">
                {sourceBadge.label}
              </Badge>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              ID: {component.id}
            </span>
          </div>

          <p className="text-foreground text-xs leading-relaxed">
            {component.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-[11px]">
            <div>
              <span className="text-muted-foreground block text-[10px]">Category:</span>
              <span className="font-semibold text-foreground capitalize">
                {component.category.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Environment:</span>
              <span className="font-mono uppercase font-semibold text-foreground">
                {component.environment}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Version:</span>
              <span className="font-mono font-semibold text-foreground">
                {component.version || 'v2.4.0'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Freshness:</span>
              <span className={`font-semibold capitalize ${component.dataFreshness === 'stale' ? 'text-amber-600 font-bold' : 'text-foreground'}`}>
                {component.dataFreshness}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Integrity Section */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Radio className="w-3.5 h-3.5 text-primary" />
            Telemetry Verification & Connection Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Telemetry Availability</span>
              <p className="font-semibold text-foreground capitalize">
                {component.telemetryAvailability}
              </p>
              {component.unavailabilityReason && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                  {component.unavailabilityReason}
                </p>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Observation Timestamps</span>
              <p className="text-[11px] font-mono text-foreground">
                Last Inspected: {formatDate(component.lastChecked, true)}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Source: {sourceBadge.description}
              </p>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="space-y-2">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Architectural Dependencies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {component.dependencies.map((dep, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md bg-muted text-foreground font-mono text-[11px] border border-border"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>

        {/* Related Incidents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Related Demonstration Incidents ({relatedIncidents.length})
            </h4>
          </div>

          {relatedIncidents.length === 0 ? (
            <div className="p-3 rounded-lg border border-border/60 bg-muted/10 text-muted-foreground text-xs">
              No open or historical incidents recorded for this component.
            </div>
          ) : (
            <div className="space-y-2">
              {relatedIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{inc.title}</span>
                      <Badge
                        variant={inc.status === 'resolved' ? 'success' : inc.severity === 'critical' ? 'error' : 'warning'}
                        size="sm"
                      >
                        {inc.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Detected: {formatDate(inc.detectedAt, true)} • Severity: {inc.severity}
                    </span>
                  </div>

                  {onSelectIncident && (
                    <button
                      type="button"
                      onClick={() => onSelectIncident(inc)}
                      className="text-primary hover:underline font-semibold text-xs self-start sm:self-center cursor-pointer"
                    >
                      View Incident
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Windows */}
        <div className="space-y-2">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            Scheduled Maintenance Windows ({relatedMaintenance.length})
          </h4>

          {relatedMaintenance.length === 0 ? (
            <div className="p-3 rounded-lg border border-border/60 bg-muted/10 text-muted-foreground text-xs">
              No active or planned maintenance windows scheduled for this component.
            </div>
          ) : (
            <div className="space-y-2">
              {relatedMaintenance.map((win) => (
                <div
                  key={win.id}
                  className="p-3 rounded-lg border border-border bg-card space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs">{win.title}</span>
                    <Badge variant={win.status === 'completed' ? 'neutral' : 'info'} size="sm">
                      {win.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{win.impactDescription}</p>
                  <span className="text-[10px] font-mono text-muted-foreground block">
                    {formatDate(win.startTime, true)} - {formatDate(win.endTime, true)} ({win.timeZone})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Future Backend Integration Roadmap */}
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
          <span className="font-bold text-primary flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Future Backend Integration Requirements:
          </span>
          <p className="text-[11px] text-muted-foreground">
            Production deployment will integrate Prometheus metrics exporters (Node, Ingress, PostgreSQL), Datadog APM tracing, and AWS CloudWatch alarms. This interface will ingest live heartbeat JSON payloads via authenticated gRPC/REST telemetry endpoints.
          </p>
        </div>
      </div>
    </Modal>
  );
}
