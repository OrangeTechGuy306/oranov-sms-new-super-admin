'use client';

import React, { useState, useMemo } from 'react';
import {
  ComplianceControl,
  ComplianceImplementationStatus,
  GovernanceEvidence,
} from '@/lib/types/compliance';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/formatters';
import {
  FileText,
  Filter,
  HelpCircle,
} from 'lucide-react';

interface ComplianceControlInventoryProps {
  controls: ComplianceControl[];
  evidenceList: GovernanceEvidence[];
  onUpdateRemediation: (
    id: string,
    notes: string,
    targetDate?: string,
    reviewer?: string
  ) => { success: boolean; error?: string };
}

export function ComplianceControlInventory({
  controls,
  evidenceList,
  onUpdateRemediation,
}: ComplianceControlInventoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);

  // Remediation edit state inside modal
  const [isEditingRemediation, setIsEditingRemediation] = useState(false);
  const [remediationNotes, setRemediationNotes] = useState('');
  const [remediationTargetDate, setRemediationTargetDate] = useState('');
  const [remediationError, setRemediationError] = useState<string | null>(null);

  const filteredControls = useMemo(() => {
    return controls.filter((ctrl) => {
      if (domainFilter !== 'all' && ctrl.domain !== domainFilter) return false;
      if (statusFilter !== 'all' && ctrl.implementationStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          ctrl.id.toLowerCase().includes(q) ||
          ctrl.name.toLowerCase().includes(q) ||
          ctrl.description.toLowerCase().includes(q) ||
          ctrl.controlOwnerRole.toLowerCase().includes(q) ||
          ctrl.frameworkMappings.some((m) =>
            m.framework.toLowerCase().includes(q) || m.controlRef.toLowerCase().includes(q)
          );
        if (!matches) return false;
      }
      return true;
    });
  }, [controls, domainFilter, statusFilter, searchQuery]);

  const handleOpenDetail = (ctrl: ComplianceControl) => {
    setSelectedControl(ctrl);
    setIsEditingRemediation(false);
    setRemediationNotes(ctrl.remediationNotes || '');
    setRemediationTargetDate(ctrl.remediationTargetDate || '');
    setRemediationError(null);
  };

  const handleSaveRemediation = () => {
    if (!selectedControl) return;
    const res = onUpdateRemediation(
      selectedControl.id,
      remediationNotes,
      remediationTargetDate || undefined
    );
    if (!res.success) {
      setRemediationError(res.error || 'Failed to update remediation plan');
      return;
    }
    // Update local selected control
    setSelectedControl({
      ...selectedControl,
      remediationNotes: remediationNotes.trim(),
      remediationTargetDate: remediationTargetDate || undefined,
      lastReviewedAt: new Date().toISOString(),
    });
    setIsEditingRemediation(false);
  };

  const getStatusBadge = (status: ComplianceImplementationStatus) => {
    switch (status) {
      case 'implemented_verified':
        return <Badge variant="success" size="sm" dot>Verified</Badge>;
      case 'partially_implemented':
        return <Badge variant="warning" size="sm" dot>Partial</Badge>;
      case 'planned':
        return <Badge variant="info" size="sm" dot>Planned</Badge>;
      case 'evidence_required':
        return <Badge variant="error" size="sm" dot>Evidence Needed</Badge>;
      case 'not_implemented':
      case 'not_assessed':
      default:
        return <Badge variant="neutral" size="sm">Not Assessed</Badge>;
    }
  };

  const linkedEvidence = useMemo(() => {
    if (!selectedControl) return [];
    return evidenceList.filter((e) => e.controlId === selectedControl.id);
  }, [selectedControl, evidenceList]);

  return (
    <div className="space-y-4">
      {/* Disclaimer Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card text-xs text-muted-foreground">
        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground">Governance Baseline Aid:</strong> This control inventory cross-references platform architecture against SOC 2, ISO 27001, GDPR, and FERPA domain frameworks. It serves as an internal governance roadmap and readiness checklist, not a formal third-party certification or legal audit opinion.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Governance Domains (10)</option>
            <option value="access_governance">Access Governance</option>
            <option value="audit_logging">Audit Logging</option>
            <option value="data_privacy">Data Privacy & Minimization</option>
            <option value="data_retention">Data Retention & Archival</option>
            <option value="tenant_isolation">Multi-Tenant Isolation</option>
            <option value="financial_traceability">Financial Traceability</option>
            <option value="incident_response">Incident Response</option>
            <option value="backup_recovery">Backup & Disaster Recovery</option>
            <option value="change_management">Change Management</option>
            <option value="operational_monitoring">Operational Monitoring</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Implementation Statuses</option>
            <option value="implemented_verified">Verified in Code & Tests</option>
            <option value="partially_implemented">Partially Implemented</option>
            <option value="planned">Planned (Backend Deferred)</option>
            <option value="evidence_required">Evidence Required</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search controls, framework refs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs rounded-lg border border-border bg-muted px-3 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none w-48 sm:w-64"
          />
          <span className="text-[11px] text-muted-foreground font-mono">
            {filteredControls.length} controls
          </span>
        </div>
      </div>

      {/* Controls Grid */}
      {filteredControls.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground text-xs">
          No compliance controls match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredControls.map((ctrl) => (
            <div
              key={ctrl.id}
              onClick={() => handleOpenDetail(ctrl)}
              className="group bg-card p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-2xs cursor-pointer transition-all space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-xs bg-muted px-2 py-0.5 rounded border border-border">
                    {ctrl.id}
                  </span>
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    {ctrl.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {ctrl.domain.replace(/_/g, ' ')}
                  </span>
                  {getStatusBadge(ctrl.implementationStatus)}
                </div>
              </div>

              <p className="text-foreground/90 text-xs leading-relaxed line-clamp-2">
                {ctrl.description}
              </p>

              {/* Framework Mapping Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {ctrl.frameworkMappings.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted/60 text-foreground border border-border"
                    title={m.description}
                  >
                    <span className="text-primary font-bold">{m.framework}:</span>
                    <span>{m.controlRef}</span>
                  </span>
                ))}
              </div>

              {/* Footer strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>Owner: <strong className="text-foreground font-mono">{ctrl.controlOwnerRole}</strong></span>
                  <span>Evidence: <strong className="text-foreground capitalize">{ctrl.evidenceStatus}</strong></span>
                  {ctrl.remediationNotes && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Has Remediation Plan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span>Reviewed: {formatDate(ctrl.lastReviewedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Control Detail & Remediation Drawer */}
      {selectedControl && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedControl(null)}
          title={`Compliance Control Specification — ${selectedControl.id}`}
          size="lg"
        >
          <div className="space-y-4 py-1 text-xs">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  {selectedControl.id}
                </span>
                <span className="font-bold text-foreground text-sm">
                  {selectedControl.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedControl.implementationStatus)}
                <Badge
                  variant={selectedControl.evidenceStatus === 'verified' ? 'success' : 'warning'}
                  size="sm"
                >
                  Evidence: {selectedControl.evidenceStatus.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Control Objective & Policy Statement
              </span>
              <p className="p-3 bg-card border border-border rounded-lg text-foreground leading-relaxed">
                {selectedControl.description}
              </p>
            </div>

            {/* Framework Mappings */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Mapped Regulatory & Industry Frameworks
              </span>
              <div className="grid grid-cols-1 gap-2">
                {selectedControl.frameworkMappings.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-start gap-2.5"
                  >
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px] shrink-0">
                      {m.framework} {m.controlRef}
                    </span>
                    <p className="text-foreground text-[11px] leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Verified Evidence */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Linked Evidence Records ({linkedEvidence.length})
              </span>
              {linkedEvidence.length === 0 ? (
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-muted-foreground text-xs text-center">
                  No automated test suite or evidence record linked to this control yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedEvidence.map((evd) => (
                    <div
                      key={evd.id}
                      className="p-3 bg-card rounded-lg border border-border flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={evd.reviewStatus === 'verified' ? 'success' : 'neutral'} size="sm">
                            {evd.reviewStatus.toUpperCase()}
                          </Badge>
                          <span className="font-bold text-foreground">{evd.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{evd.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-primary">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>Source: {evd.sourceReference}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{evd.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remediation Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Remediation & Compliance Action Plan
                </span>
                {!isEditingRemediation && (
                  <button
                    type="button"
                    onClick={() => setIsEditingRemediation(true)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit Remediation Plan
                  </button>
                )}
              </div>

              {isEditingRemediation ? (
                <div className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border">
                  {remediationError && (
                    <div className="p-2 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
                      {remediationError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">
                      Remediation Notes / Planned Implementation *
                    </label>
                    <textarea
                      value={remediationNotes}
                      onChange={(e) => setRemediationNotes(e.target.value)}
                      placeholder="Specify technical milestones, backend dependencies, or target sprint..."
                      rows={3}
                      className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={remediationTargetDate}
                      onChange={(e) => setRemediationTargetDate(e.target.value)}
                      className="rounded-lg border border-border bg-card p-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingRemediation(false)}
                      className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRemediation}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
                    >
                      Save Remediation Plan
                    </button>
                  </div>
                </div>
              ) : selectedControl.remediationNotes ? (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
                    <span>Remediation Roadmap</span>
                    {selectedControl.remediationTargetDate && (
                      <span className="font-mono text-[11px]">
                        Target Date: {selectedControl.remediationTargetDate}
                      </span>
                    )}
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
                    {selectedControl.remediationNotes}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px]">
                  No outstanding remediation required. Control verified or under active maintenance.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
