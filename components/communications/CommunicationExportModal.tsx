'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { validateImportCommunicationPackage } from '@/lib/communications/exporter';
import { Download, Upload, ShieldCheck, AlertCircle, CheckCircle2, FileText, Copy, Check } from 'lucide-react';

interface CommunicationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunicationExportModal({ isOpen, onClose }: CommunicationExportModalProps) {
  const { exportCommunicationGovernancePackage, createCommunicationTemplate, createNotificationPolicy, addToast } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate safe export package
  const exportPackage = exportCommunicationGovernancePackage('Alexander Sterling');
  const exportJsonString = JSON.stringify(exportPackage, null, 2);

  // Download JSON Handler
  const handleDownload = () => {
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `communication_governance_package_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Package Downloaded', message: 'Saved clean JSON package.' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Import Validation
  let importValidation = null;
  if (importJsonText.trim()) {
    try {
      const parsed = JSON.parse(importJsonText);
      importValidation = validateImportCommunicationPackage(parsed);
    } catch {
      importValidation = {
        isValid: false,
        errors: ['Malformed JSON syntax: Cannot parse input.'],
        warnings: [],
        templatesToImport: 0,
        policiesToImport: 0,
        campaignsToImport: 0,
        summary: 'Invalid JSON string.',
      };
    }
  }

  const handleApplyImport = () => {
    if (!importValidation || !importValidation.isValid) return;

    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed.templates)) {
        parsed.templates.forEach((t: any) => {
          createCommunicationTemplate(t, 'Imported via Super-Admin');
        });
      }
      if (Array.isArray(parsed.policies)) {
        parsed.policies.forEach((p: any) => {
          createNotificationPolicy(p, 'Imported via Super-Admin');
        });
      }
      addToast({
        type: 'success',
        title: 'Configuration Imported',
        message: `Successfully imported ${importValidation.templatesToImport} templates and ${importValidation.policiesToImport} policies into local demo store.`,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Import Failed', message: err.message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Communication Configuration Portability"
      description="Export non-sensitive templates and policies or validate and import external JSON packages."
      size="lg"
    >
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex border-b border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Safe Export Package
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Validate & Import Package
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-3 text-xs">
            {/* Zero-Secret Guarantee Banner */}
            <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Zero-Secret Guarantee:</strong> Provider API keys, credentials, and sensitive personal recipient details are permanently excluded from exports.
              </span>
            </div>

            {/* Package Summary */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-muted/30 border border-border">
                <span className="font-bold text-foreground block font-mono text-sm">
                  {exportPackage.summaryMetrics.totalTemplates}
                </span>
                <span className="text-[10.5px] text-muted-foreground">Templates</span>
              </div>
              <div className="p-2 rounded bg-muted/30 border border-border">
                <span className="font-bold text-foreground block font-mono text-sm">
                  {exportPackage.summaryMetrics.totalPolicies}
                </span>
                <span className="text-[10.5px] text-muted-foreground">Policies</span>
              </div>
              <div className="p-2 rounded bg-muted/30 border border-border">
                <span className="font-bold text-foreground block font-mono text-sm">
                  {exportPackage.summaryMetrics.totalProviders}
                </span>
                <span className="text-[10.5px] text-muted-foreground">Providers</span>
              </div>
              <div className="p-2 rounded bg-muted/30 border border-border">
                <span className="font-bold text-foreground block font-mono text-sm">
                  {exportPackage.summaryMetrics.totalCampaigns}
                </span>
                <span className="text-[10.5px] text-muted-foreground">Campaigns</span>
              </div>
            </div>

            {/* Code Box */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  JSON Package Preview (v{exportPackage.formatVersion})
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <textarea
                readOnly
                rows={8}
                value={exportJsonString}
                className="w-full text-xs font-mono p-3 rounded-lg border border-border bg-muted/20 text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground text-[11.5px]">
              Paste an exported Communication Governance JSON package to validate and apply to the local demonstration store.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON package here..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />

            {/* Validation Outcome */}
            {importValidation && (
              <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                importValidation.isValid
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {importValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{importValidation.summary}</span>
                </div>
                {importValidation.errors.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {importValidation.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                disabled={!importValidation || !importValidation.isValid}
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Apply to Local Store
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
