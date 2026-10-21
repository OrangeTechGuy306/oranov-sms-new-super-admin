'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PlatformIncident,
  IncidentLifecycleStatus,
  IncidentSeverity,
  OperationalComponent,
} from '@/lib/system-health/types';
import {
  validateIncidentTransition,
  calculateIncidentMttr,
  getValidIncidentTransitions,
} from '@/lib/system-health/evaluator';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
  PlusCircle,
  MessageSquare,
  Search,
  RotateCcw,
  ShieldAlert,
  FileText,
  UserCheck,
  Radio,
} from 'lucide-react';

interface IncidentManagementWorkspaceProps {
  incidents: PlatformIncident[];
  components: OperationalComponent[];
  onAcknowledge: (id: string, actor?: string) => void;
  onTransitionStatus: (
    id: string,
    newStatus: IncidentLifecycleStatus,
    context?: { resolutionNotes?: string; rootCause?: string; reopenReason?: string },
    actor?: string
  ) => void;
  onAddNote: (id: string, message: string, author?: string) => void;
  selectedIncidentFromProps?: PlatformIncident | null;
  onClearSelectedIncident?: () => void;
}

export function IncidentManagementWorkspace({
  incidents,
  components,
  onAcknowledge,
  onTransitionStatus,
  onAddNote,
  selectedIncidentFromProps,
  onClearSelectedIncident,
}: IncidentManagementWorkspaceProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');

  // Modal inspection state
  const [inspectIncident, setInspectIncident] = useState<PlatformIncident | null>(null);

  // Dialog states
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Form states
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [investigationNote, setInvestigationNote] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Keep inspected incident synced with store or props
  const activeIncident = useMemo(() => {
    const target = inspectIncident || selectedIncidentFromProps;
    if (!target) return null;
    return incidents.find((i) => i.id === target.id) || target;
  }, [incidents, inspectIncident, selectedIncidentFromProps]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesComp =
        componentFilter === 'all' || inc.affectedComponents.includes(componentFilter);

      return matchesSearch && matchesStatus && matchesSeverity && matchesComp;
    });
  }, [incidents, searchQuery, statusFilter, severityFilter, componentFilter]);

  // Metrics
  const mttrMetrics = useMemo(() => calculateIncidentMttr(incidents), [incidents]);
  const openCount = incidents.filter((i) => i.status === 'open').length;
  const acknowledgedCount = incidents.filter((i) => i.status === 'acknowledged').length;
  const investigatingCount = incidents.filter((i) => i.status === 'investigating').length;
  const monitoringCount = incidents.filter((i) => i.status === 'monitoring').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  const handleOpenResolve = () => {
    setResolutionNotes('');
    setRootCause('');
    setFormError(null);
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = () => {
    if (!activeIncident) return;
    const validation = validateIncidentTransition(activeIncident, 'resolved', {
      resolutionNotes,
      rootCause,
    });
    if (!validation.isValid) {
      setFormError(validation.error || 'Validation failed');
      return;
    }
    onTransitionStatus(activeIncident.id, 'resolved', { resolutionNotes, rootCause });
    setIsResolveModalOpen(false);
  };

  const handleOpenNote = () => {
    setInvestigationNote('');
    setFormError(null);
    setIsNoteModalOpen(true);
  };

  const handleConfirmNote = () => {
    if (!activeIncident) return;
    if (!investigationNote || investigationNote.trim().length < 5) {
      setFormError('Investigation note must be at least 5 characters.');
      return;
    }
    onAddNote(activeIncident.id, investigationNote.trim());
    setIsNoteModalOpen(false);
  };

  const handleOpenReopen = () => {
    setReopenReason('');
    setFormError(null);
    setIsReopenModalOpen(true);
  };

  const handleConfirmReopen = () => {
    if (!activeIncident) return;
    const validation = validateIncidentTransition(activeIncident, 'open', {
      reopenReason,
    });
    if (!validation.isValid) {
      setFormError(validation.error || 'Validation failed');
      return;
    }
    onTransitionStatus(activeIncident.id, 'open', { reopenReason });
    setIsReopenModalOpen(false);
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="error" size="sm" dot>CRITICAL</Badge>;
      case 'high':
        return <Badge variant="warning" size="sm" dot>HIGH</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">LOW</Badge>;
    }
  };

  const getStatusBadge = (st: IncidentLifecycleStatus) => {
    switch (st) {
      case 'open':
        return <Badge variant="error" size="sm">OPEN</Badge>;
      case 'acknowledged':
        return <Badge variant="info" size="sm">ACKNOWLEDGED</Badge>;
      case 'investigating':
        return <Badge variant="warning" size="sm" dot>INVESTIGATING</Badge>;
      case 'monitoring':
        return <Badge variant="purple" size="sm" dot>MONITORING</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm">RESOLVED</Badge>;
    }
  };

  const columns: Column<PlatformIncident>[] = [
    {
      key: 'title',
      header: 'Incident & Description',
      render: (inc) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              onClick={() => setInspectIncident(inc)}
              className="font-bold text-xs text-foreground hover:text-primary cursor-pointer transition-colors"
            >
              {inc.title}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">
            {inc.description}
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">
            ID: {inc.id} • Detected: {formatDate(inc.detectedAt, true)}
          </span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (inc) => getSeverityBadge(inc.severity),
    },
    {
      key: 'status',
      header: 'Lifecycle State',
      render: (inc) => getStatusBadge(inc.status),
    },
    {
      key: 'affectedComponents',
      header: 'Affected Components',
      render: (inc) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {inc.affectedComponents.map((compId) => {
            const comp = components.find((c) => c.id === compId);
            return (
              <span
                key={compId}
                className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50"
              >
                {comp?.name || compId}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'operator',
      header: 'Assigned Operator',
      render: (inc) => (
        <div className="text-xs">
          <span className="font-semibold text-foreground block">
            {inc.assignedOperator?.name || 'Unassigned'}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {inc.assignedOperator?.email || 'Awaiting triage'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Manage',
      render: (inc) => (
        <button
          type="button"
          onClick={() => setInspectIncident(inc)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-primary" />
          Timeline & Actions
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Detected & Open"
          value={openCount}
          subtitle="Awaiting acknowledgement"
          icon={<AlertOctagon className={`w-4 h-4 ${openCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />}
        />
        <StatCard
          title="Acknowledged"
          value={acknowledgedCount}
          subtitle="Triage initiated"
          icon={<UserCheck className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Investigating"
          value={investigatingCount}
          subtitle="Root cause analysis"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Monitoring"
          value={monitoringCount}
          subtitle="Post-mitigation check"
          icon={<Radio className="w-4 h-4 text-purple-500" />}
        />
        <StatCard
          title="Resolved Records"
          value={resolvedCount}
          subtitle="Permanently closed"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Mean Time to Resolve"
          value={mttrMetrics.formattedMttr}
          subtitle={`Across ${mttrMetrics.resolvedCount} resolved`}
          icon={<Clock className="w-4 h-4 text-primary" />}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incident title, ID, root cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Incident Statuses</option>
            <option value="open">Open (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Affected Components</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {(searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || componentFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSeverityFilter('all');
                  setComponentFilter('all');
                }}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <DataTable
        data={filteredIncidents}
        columns={columns}
        keyExtractor={(inc) => inc.id}
        emptyMessage="No incidents match the selected search and filter criteria."
      />

      {/* Incident Detail & Lifecycle Management Modal */}
      {activeIncident && (
        <Modal
          isOpen={!!activeIncident}
          onClose={() => {
            setInspectIncident(null);
            if (onClearSelectedIncident) onClearSelectedIncident();
          }}
          title={activeIncident.title}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Link
                href={`/audit-logs?searchQuery=${encodeURIComponent(activeIncident.id)}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                Audit Trail for Incident {activeIncident.id}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setInspectIncident(null);
                  if (onClearSelectedIncident) onClearSelectedIncident();
                }}
                className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Close Drawer
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Header Status Card */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(activeIncident.severity)}
                  {getStatusBadge(activeIncident.status)}
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  ID: {activeIncident.id}
                </span>
              </div>

              <p className="text-foreground text-xs leading-relaxed">
                {activeIncident.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-[11px] font-mono">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Detected:</span>
                  <span className="text-foreground">{formatDate(activeIncident.detectedAt, true)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Acknowledged:</span>
                  <span className="text-foreground">{formatDate(activeIncident.acknowledgedAt, true)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Resolved:</span>
                  <span className="text-foreground">{formatDate(activeIncident.resolvedAt, true)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Assigned Operator:</span>
                  <span className="text-foreground font-semibold">
                    {activeIncident.assignedOperator?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle Action Buttons Bar */}
            <div className="p-3 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Lifecycle Actions:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Acknowledge */}
                {activeIncident.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => onAcknowledge(activeIncident.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Acknowledge Incident
                  </button>
                )}

                {/* 2. Begin Investigation */}
                {activeIncident.status === 'acknowledged' && (
                  <button
                    type="button"
                    onClick={() => onTransitionStatus(activeIncident.id, 'investigating')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Begin Investigation
                  </button>
                )}

                {/* 3. Move to Monitoring */}
                {activeIncident.status === 'investigating' && (
                  <button
                    type="button"
                    onClick={() => onTransitionStatus(activeIncident.id, 'monitoring')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Move to Monitoring
                  </button>
                )}

                {/* 4. Resolve Incident */}
                {(activeIncident.status === 'investigating' || activeIncident.status === 'monitoring') && (
                  <button
                    type="button"
                    onClick={handleOpenResolve}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Resolve Incident
                  </button>
                )}

                {/* 5. Reopen Incident */}
                {activeIncident.status === 'resolved' && (
                  <button
                    type="button"
                    onClick={handleOpenReopen}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Reopen Incident
                  </button>
                )}

                {/* Add Investigation Note */}
                <button
                  type="button"
                  onClick={handleOpenNote}
                  className="px-3 py-1.5 bg-card hover:bg-muted text-foreground border border-border rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  Add Note
                </button>
              </div>
            </div>

            {/* Root Cause & Resolution Summary if resolved */}
            {activeIncident.status === 'resolved' && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolution & Root Cause Summary
                </span>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong>Root Cause:</strong> {activeIncident.rootCause}
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong>Resolution Notes:</strong> {activeIncident.resolutionNotes}
                </p>
              </div>
            )}

            {/* Chronological Incident Timeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Chronological Incident Timeline ({activeIncident.timeline.length} events)
              </h4>

              <div className="border-l-2 border-border pl-4 space-y-4 ml-2">
                {activeIncident.timeline.map((evt) => (
                  <div key={evt.id} className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-foreground text-xs">{evt.author}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatDate(evt.timestamp, true)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {evt.message}
                    </p>
                    {evt.newStatus && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground inline-block">
                        Status &rarr; {evt.newStatus}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Resolve Incident Dialog */}
      {isResolveModalOpen && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Resolve Demonstration Incident"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Confirm Resolution
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Marking an incident as resolved updates local demonstration state, sets the resolved timestamp, and returns affected components to healthy status.
            </p>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Root Cause Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Stripe webhook secret rotation mismatch in ingress pod"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Resolution & Mitigation Actions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Detail what actions were taken to restore service and prevent recurrence..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Investigation Note Dialog */}
      {isNoteModalOpen && (
        <Modal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          title="Add Investigation Note"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNote}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Append Note to Timeline
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Investigation notes document telemetry observations, mitigation steps, or external vendor communication.
            </p>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Investigation Update Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Enter investigation update details..."
                value={investigationNote}
                onChange={(e) => setInvestigationNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Reopen Incident Dialog */}
      {isReopenModalOpen && (
        <Modal
          isOpen={isReopenModalOpen}
          onClose={() => setIsReopenModalOpen(false)}
          title="Reopen Incident"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReopen}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Reopen Incident
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Reopening a resolved incident requires an explicit justification explaining why recurrence was detected or why prior resolution was insufficient.
            </p>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Reopening Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Reason recurrence was identified..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
