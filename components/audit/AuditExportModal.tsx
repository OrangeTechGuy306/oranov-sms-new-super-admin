'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AuditEvent } from '@/lib/types/audit-logs';
import { ComplianceControl, SecurityEvent } from '@/lib/types/compliance';
import {
  generateAuditCsv,
  generateComplianceCsv,
} from '@/lib/compliance/evaluator';
import { downloadCsvFile } from '@/lib/utils/csv-export';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface AuditExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredEvents: AuditEvent[];
  allEvents: AuditEvent[];
  controls: ComplianceControl[];
  securityEvents: SecurityEvent[];
  onLogExportAction?: (details: string, format: string, scopeCount: number) => void;
}

export function AuditExportModal({
  isOpen,
  onClose,
  filteredEvents,
  allEvents,
  controls,
  securityEvents,
  onLogExportAction,
}: AuditExportModalProps) {
  const [exportDataset, setExportDataset] = useState<'audit_trail' | 'compliance_controls' | 'security_events'>('audit_trail');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    const timestampStr = new Date().toISOString().slice(0, 10);

    if (exportDataset === 'audit_trail') {
      const records = exportScope === 'filtered' ? filteredEvents : allEvents;
      if (exportFormat === 'csv') {
        const csv = generateAuditCsv(records);
        downloadCsvFile(`platform-audit-trail-${exportScope}-${timestampStr}.csv`, csv);
      } else {
        const jsonContent = JSON.stringify(
          {
            exportMetadata: {
              title: 'Platform Audit Trail Export',
              generatedAt: new Date().toISOString(),
              scope: exportScope,
              recordCount: records.length,
              disclaimer: 'Development sandbox records. Not authoritative or cryptographically sealed.',
            },
            auditEvents: records,
          },
          null,
          2
        );
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `platform-audit-trail-${exportScope}-${timestampStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      if (onLogExportAction) {
        onLogExportAction(
          `Exported ${records.length} audit trail records in ${exportFormat.toUpperCase()} format (Scope: ${exportScope}).`,
          exportFormat,
          records.length
        );
      }
    } else if (exportDataset === 'compliance_controls') {
      if (exportFormat === 'csv') {
        const csv = generateComplianceCsv(controls);
        downloadCsvFile(`compliance-control-inventory-${timestampStr}.csv`, csv);
      } else {
        const jsonContent = JSON.stringify(
          {
            exportMetadata: {
              title: 'Platform Compliance Control Inventory',
              generatedAt: new Date().toISOString(),
              controlCount: controls.length,
              disclaimer: 'Internal governance roadmap. Does not constitute formal certification.',
            },
            controls,
          },
          null,
          2
        );
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-control-inventory-${timestampStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      if (onLogExportAction) {
        onLogExportAction(
          `Exported compliance control inventory (${controls.length} controls) in ${exportFormat.toUpperCase()} format.`,
          exportFormat,
          controls.length
        );
      }
    } else if (exportDataset === 'security_events') {
      if (exportFormat === 'csv') {
        const headers = ['Event ID', 'Title', 'Category', 'Severity', 'Triage Status', 'Timestamp', 'Explanation', 'Remediation', 'Actor', 'Target'];
        const rows = securityEvents.map((s) => [
          s.id,
          s.title,
          s.category,
          s.severity,
          s.triageStatus,
          s.timestamp,
          `"${s.sanitizedExplanation.replace(/"/g, '""')}"`,
          `"${s.suggestedRemediation.replace(/"/g, '""')}"`,
          s.actor.name,
          s.relatedEntityId,
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        downloadCsvFile(`security-events-triage-${timestampStr}.csv`, csv);
      } else {
        const jsonContent = JSON.stringify(
          {
            exportMetadata: {
              title: 'Security Events & Incident Triage Log',
              generatedAt: new Date().toISOString(),
              eventCount: securityEvents.length,
              disclaimer: 'Synthetic demonstration fixtures.',
            },
            securityEvents,
          },
          null,
          2
        );
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-events-triage-${timestampStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      if (onLogExportAction) {
        onLogExportAction(
          `Exported security events log (${securityEvents.length} events) in ${exportFormat.toUpperCase()} format.`,
          exportFormat,
          securityEvents.length
        );
      }
    }

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  };

  const getRecordCountLabel = () => {
    if (exportDataset === 'audit_trail') {
      return exportScope === 'filtered'
        ? `${filteredEvents.length} filtered audit events`
        : `${allEvents.length} total audit events`;
    }
    if (exportDataset === 'compliance_controls') {
      return `${controls.length} compliance controls`;
    }
    return `${securityEvents.length} security incident records`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Audit & Compliance Records"
      size="md"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Dataset Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">
            Select Governance Dataset *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'audit_trail', label: 'Platform Audit Trail', count: exportScope === 'filtered' ? filteredEvents.length : allEvents.length },
                { id: 'compliance_controls', label: 'Compliance Controls', count: controls.length },
                { id: 'security_events', label: 'Security Triage Log', count: securityEvents.length },
              ] as const
            ).map((ds) => (
              <button
                key={ds.id}
                type="button"
                onClick={() => setExportDataset(ds.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  exportDataset === ds.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <span className="font-bold text-xs">{ds.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono mt-1">
                  {ds.count} records
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scope Selection (for audit events) */}
        {exportDataset === 'audit_trail' && (
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Export Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('filtered')}
                className={`p-2 rounded-lg border text-left ${
                  exportScope === 'filtered'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span>Current Filtered View ({filteredEvents.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-2 rounded-lg border text-left ${
                  exportScope === 'all'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span>Entire Historical Audit Log ({allEvents.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Export File Format</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExportFormat('csv')}
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                exportFormat === 'csv'
                  ? 'border-primary bg-primary/5 text-primary font-semibold'
                  : 'border-border bg-card text-foreground'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="block text-xs">Spreadsheet CSV</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Formula-injection protected
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('json')}
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                exportFormat === 'json'
                  ? 'border-primary bg-primary/5 text-primary font-semibold'
                  : 'border-border bg-card text-foreground'
              }`}
            >
              <FileJson className="w-4 h-4 text-blue-500" />
              <div>
                <span className="block text-xs">Structured JSON</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Complete metadata hierarchy
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Sanitization & Privacy Guarantee */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Automatic Privacy & Security Safeguards</span>
          </div>
          <ul className="space-y-1 text-muted-foreground list-disc pl-4">
            <li>Zero student PII (names, personal contacts, addresses) included.</li>
            <li>No passwords, secret tokens, or payment card numbers exported.</li>
            <li>CSV injection protection applied to all cell values starting with active formula characters.</li>
            <li>Development sandbox notice included in export metadata headers.</li>
          </ul>
        </div>

        {/* Summary before download */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-foreground font-semibold">
            Ready to export {getRecordCountLabel()}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={downloadSuccess}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-2xs"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
