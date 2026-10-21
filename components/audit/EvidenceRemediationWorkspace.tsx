'use client';

import React, { useState, useMemo } from 'react';
import { GovernanceEvidence, GovernanceEvidenceType } from '@/lib/types/compliance';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/formatters';
import {
  Filter,
  FileCode,
  Info,
} from 'lucide-react';

interface EvidenceRemediationWorkspaceProps {
  evidenceList: GovernanceEvidence[];
  onUpdateEvidenceStatus: (
    id: string,
    status: 'verified' | 'pending_inspection' | 'unavailable',
    notes?: string,
    reviewer?: string
  ) => { success: boolean; error?: string };
}

export function EvidenceRemediationWorkspace({
  evidenceList,
  onUpdateEvidenceStatus,
}: EvidenceRemediationWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [inspectEvidence, setInspectEvidence] = useState<GovernanceEvidence | null>(null);
  const [targetStatus, setTargetStatus] = useState<'verified' | 'pending_inspection' | 'unavailable'>('verified');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Elena Rostova (Compliance Auditor)');

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((evd) => {
      if (typeFilter !== 'all' && evd.evidenceType !== typeFilter) return false;
      if (statusFilter !== 'all' && evd.reviewStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          evd.id.toLowerCase().includes(q) ||
          evd.title.toLowerCase().includes(q) ||
          evd.sourceReference.toLowerCase().includes(q) ||
          evd.notes.toLowerCase().includes(q) ||
          evd.controlId.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [evidenceList, typeFilter, statusFilter, searchQuery]);

  const handleOpenReview = (evd: GovernanceEvidence) => {
    setInspectEvidence(evd);
    setTargetStatus(evd.reviewStatus);
    setReviewNotes(evd.notes || '');
  };

  const handleSaveReview = () => {
    if (!inspectEvidence) return;
    onUpdateEvidenceStatus(inspectEvidence.id, targetStatus, reviewNotes, reviewerName);
    setInspectEvidence(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" size="sm" dot>Verified</Badge>;
      case 'pending_inspection':
        return <Badge variant="warning" size="sm" dot>Pending Review</Badge>;
      case 'unavailable':
      default:
        return <Badge variant="error" size="sm" dot>Unavailable</Badge>;
    }
  };

  const getTypeLabel = (type: GovernanceEvidenceType) => {
    switch (type) {
      case 'test_suite_verification':
        return 'Automated Test Suite';
      case 'code_inspection':
        return 'Code Implementation';
      case 'architectural_specification':
        return 'Architectural Blueprint';
      case 'configuration_manifest':
        return 'Config Manifest';
      case 'audit_trail_sample':
        return 'Audit Trail Sample';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {/* Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground">Traceable Verification Evidence:</strong> All governance controls in the platform are backed by verifiable evidence records pointing directly to actual automated test suites, architectural schemas, and data fixtures in the active repository.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Evidence Types</option>
            <option value="test_suite_verification">Automated Test Suites</option>
            <option value="code_inspection">Code Inspections</option>
            <option value="architectural_specification">Architectural Blueprints</option>
            <option value="configuration_manifest">Configuration Manifests</option>
            <option value="audit_trail_sample">Audit Trail Samples</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Review Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending_inspection">Pending Inspection</option>
            <option value="unavailable">Unavailable (Deferred)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search evidence records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs rounded-lg border border-border bg-muted px-3 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none w-48 sm:w-64"
          />
          <span className="text-[11px] text-muted-foreground font-mono">
            {filteredEvidence.length} records
          </span>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      {filteredEvidence.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground text-xs">
          No governance evidence records match the current filter selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredEvidence.map((evd) => (
            <div
              key={evd.id}
              className="bg-card p-4 rounded-xl border border-border hover:border-border/80 transition-all space-y-2.5 text-xs shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border text-[11px]">
                    {evd.id}
                  </span>
                  <span className="font-bold text-foreground text-sm">{evd.title}</span>
                  <Badge variant="purple" size="sm">
                    {evd.controlId}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(evd.reviewStatus)}
                  <button
                    type="button"
                    onClick={() => handleOpenReview(evd)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs transition-colors"
                  >
                    <span>Update Status</span>
                  </button>
                </div>
              </div>

              {/* Source Reference Code Block */}
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border flex items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-foreground truncate">
                  <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{evd.sourceReference}</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold shrink-0">
                  {getTypeLabel(evd.evidenceType)}
                </span>
              </div>

              {/* Notes */}
              <p className="text-foreground/90 text-xs leading-relaxed">
                {evd.notes}
              </p>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                <span>
                  Reviewer: <strong className="text-foreground">{evd.reviewerLabel}</strong>
                </span>
                <span className="font-mono text-[10px]">
                  Collected / Audited: {formatDate(evd.collectionDate, true)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {inspectEvidence && (
        <Modal
          isOpen={true}
          onClose={() => setInspectEvidence(null)}
          title={`Evidence Verification Review — ${inspectEvidence.id}`}
          size="md"
        >
          <div className="space-y-4 py-1 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
              <span className="font-bold text-foreground text-sm block">
                {inspectEvidence.title}
              </span>
              <p className="text-primary font-mono text-[11px]">
                {inspectEvidence.sourceReference}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Verification Review Decision *
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as 'verified' | 'pending_inspection' | 'unavailable')}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              >
                <option value="verified">Verified (Validated against repository code/tests)</option>
                <option value="pending_inspection">Pending Inspection</option>
                <option value="unavailable">Unavailable (Deferred to backend)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Auditor / Reviewer Identity
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Verification Notes & Audit Findings
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add audit assessment details or verification observations..."
                rows={3}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground italic">
                Simulated state change. Persists to local store.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectEvidence(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-2xs"
                >
                  Save Verification Record
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
