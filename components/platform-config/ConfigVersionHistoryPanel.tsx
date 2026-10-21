'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  ConfigVersionEntry,
  ConfigExportPackage,
  ConfigImportValidationResult
} from '@/lib/types/platform-config';
import { validateImportPackage } from '@/lib/platform-config/exporter';
import {
  History,
  Download,
  Upload,
  RotateCcw,
  Eye,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  User,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';

export function ConfigVersionHistoryPanel() {
  const {
    configVersions,
    exportConfiguration,
    importConfiguration,
    restoreConfigVersion,
    addToast
  } = usePlatformStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  // Diff inspection modal
  const [inspectingVersion, setInspectingVersion] = useState<ConfigVersionEntry | null>(null);

  // Restore confirmation modal
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  // Export scope
  const [exportScope, setExportScope] = useState<'all' | 'settings_only' | 'flags_only' | 'overrides_only'>('all');

  // Import modal & file state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importValidationResult, setImportValidationResult] = useState<ConfigImportValidationResult | null>(null);

  // Filtered versions
  const filteredVersions = useMemo(() => {
    return configVersions.filter(v => {
      if (actionFilter !== 'all' && v.action !== actionFilter) return false;
      if (entityFilter !== 'all' && v.entityType !== entityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.entityName.toLowerCase().includes(q) ||
          v.entityId.toLowerCase().includes(q) ||
          v.reason.toLowerCase().includes(q) ||
          v.actor.name.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [configVersions, actionFilter, entityFilter, searchQuery]);

  // Export action handler
  const handleExport = () => {
    try {
      const pkg = exportConfiguration(exportScope);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pkg, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `sms-platform-config-${exportScope}-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast({
        type: 'success',
        title: 'Safe Configuration Exported',
        message: `Generated JSON package (${exportScope}). Zero secrets or private keys exported.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message
      });
    }
  };

  // Import file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      try {
        const parsed = JSON.parse(content);
        const report = validateImportPackage(parsed);
        setImportValidationResult(report);
      } catch (err: any) {
        setImportValidationResult({
          isValid: false,
          schemaVersion: 'unknown',
          createCount: 0,
          updateCount: 0,
          skipCount: 0,
          rejectCount: 1,
          errors: [`Invalid JSON format: ${err.message}`],
          warnings: [],
          previewItems: []
        });
      }
    };
    reader.readAsText(file);
  };

  // Validate pasted text
  const handleValidatePastedJson = (text: string) => {
    setImportJsonText(text);
    if (!text.trim()) {
      setImportValidationResult(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const report = validateImportPackage(parsed);
      setImportValidationResult(report);
    } catch (err: any) {
      setImportValidationResult({
        isValid: false,
        schemaVersion: 'unknown',
        createCount: 0,
        updateCount: 0,
        skipCount: 0,
        rejectCount: 1,
        errors: [`Invalid JSON format: ${err.message}`],
        warnings: [],
        previewItems: []
      });
    }
  };

  // Apply Import Confirmation
  const handleApplyImport = () => {
    if (!importValidationResult?.isValid) {
      addToast({
        type: 'error',
        title: 'Cannot Apply Invalid Import',
        message: importValidationResult?.errors[0] || 'Fix errors before importing.'
      });
      return;
    }

    const res = importConfiguration(importJsonText, 'Super-Admin Lead (Current)');
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Configuration Imported (Local Store)',
        message: `Imported ${res.result.createCount} created, ${res.result.updateCount} updated items.`
      });
      setIsImportModalOpen(false);
      setImportJsonText('');
      setImportValidationResult(null);
    } else {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: res.error
      });
    }
  };

  // Restore action handler
  const handleRestore = (versionId: string) => {
    const res = restoreConfigVersion(versionId, 'Super-Admin Lead (Current)');
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Configuration Restored',
        message: `Version ${versionId} restored to active demonstration state.`
      });
      setRestoringVersionId(null);
      if (inspectingVersion?.id === versionId) {
        setInspectingVersion(null);
      }
    } else {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        message: res.error
      });
    }
  };

  const getActionBadge = (action: ConfigVersionEntry['action']) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
            UPDATE
          </span>
        );
      case 'TOGGLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
            TOGGLE
          </span>
        );
      case 'OVERRIDE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            OVERRIDE
          </span>
        );
      case 'RESTORE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
            RESTORE
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            DELETE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export/Import Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Configuration Audit History & Safe Portability
          </h3>
          <p className="text-xs text-slate-500">
            Track timestamped configuration snapshots, inspect visual diffs, and export/import non-secret packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Controls */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value as any)}
              className="text-xs bg-transparent border-none text-slate-700 dark:text-slate-200 focus:ring-0 font-medium cursor-pointer"
            >
              <option value="all">Full Bundle (Settings, Flags, Overrides)</option>
              <option value="settings_only">Platform Settings Only</option>
              <option value="flags_only">Feature Flags Registry Only</option>
              <option value="overrides_only">Tenant Overrides Only</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import Package...
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by entity, reason, actor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Actions</option>
            <option value="UPDATE">Update</option>
            <option value="TOGGLE">Toggle</option>
            <option value="OVERRIDE">Override</option>
            <option value="RESTORE">Restore</option>
            <option value="CREATE">Create</option>
          </select>

          {/* Entity Type Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Entities</option>
            <option value="PlatformSettings">Platform Settings</option>
            <option value="FeatureFlag">Feature Flags</option>
            <option value="TenantOverride">Tenant Overrides</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredVersions.length} of {configVersions.length} snapshots
        </span>
      </div>

      {/* Version History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredVersions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No historical configuration versions match criteria
            </h4>
            <p className="text-xs text-slate-500">
              Clear filters or make a configuration adjustment to record a new snapshot.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp & ID</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Reason / Context</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredVersions.map((version) => (
                  <tr key={version.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Timestamp & ID */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {version.id}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      {getActionBadge(version.action)}
                    </td>

                    {/* Target Entity */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {version.entityName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                        {version.entityType} ({version.entityId})
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {version.actor.name}
                      </div>
                      <span className="text-[10px] text-slate-400 block pl-5 capitalize">
                        {version.actor.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Reason / Context */}
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                        &quot;{version.reason}&quot;
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingVersion(version)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          Diff
                        </button>

                        {version.canRestore && (
                          <button
                            type="button"
                            onClick={() => setRestoringVersionId(version.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diff Inspection Modal */}
      {inspectingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  Version Snapshot Diff
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {inspectingVersion.id} • {new Date(inspectingVersion.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingVersion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Entity:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {inspectingVersion.entityName} ({inspectingVersion.entityType})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {inspectingVersion.actor.name} ({inspectingVersion.actor.role})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Recorded Reason:</span>
                <p className="italic text-slate-700 dark:text-slate-300 pl-2 border-l-2 border-indigo-400">
                  &quot;{inspectingVersion.reason}&quot;
                </p>
              </div>
            </div>

            {/* Diff Items */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Recorded Field Adjustments
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-sans text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Before</th>
                      <th className="px-3 py-2">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                    {inspectingVersion.diff.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white font-sans">
                          {item.field}
                        </td>
                        <td className="px-3 py-2 text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/20">
                          {String(item.previousValue)}
                        </td>
                        <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                          {String(item.proposedValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {inspectingVersion.canRestore && (
                <button
                  type="button"
                  onClick={() => {
                    setRestoringVersionId(inspectingVersion.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Prior Snapshot
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectingVersion(null)}
                className="px-4 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      {restoringVersionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Confirm Snapshot Restoration
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Target Version: {restoringVersionId}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Restoring this snapshot will apply its prior field values to the active local demonstration store. An audit event and new restoration version record will be created.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRestoringVersionId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRestore(restoringVersionId)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Import Configuration Package (Pre-Validation Preview)
                </h3>
                <p className="text-xs text-slate-500">
                  Select a JSON configuration package or paste content below. Strict schema and zero-secret rules apply.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Upload & Paste Controls */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload Package JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/40 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Or Paste JSON Schema Payload
                </label>
                <textarea
                  rows={5}
                  value={importJsonText}
                  onChange={(e) => handleValidatePastedJson(e.target.value)}
                  placeholder='{"schemaVersion": "1.0.0", "flags": [...], ...}'
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Pre-Validation Report */}
            {importValidationResult && (
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {importValidationResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    Pre-Import Analysis Report
                  </h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    importValidationResult.isValid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}>
                    {importValidationResult.isValid ? 'Schema Valid' : 'Schema Invalid'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Create</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {importValidationResult.createCount}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Update</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {importValidationResult.updateCount}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Skip</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                      {importValidationResult.skipCount}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Reject</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {importValidationResult.rejectCount}
                    </span>
                  </div>
                </div>

                {importValidationResult.errors.length > 0 && (
                  <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs space-y-1">
                    <span className="font-semibold block">Validation Errors:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {importValidationResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importValidationResult.previewItems.length > 0 && (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                      Itemized Impact Preview:
                    </span>
                    <div className="space-y-1">
                      {importValidationResult.previewItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            [{item.entity}] {item.key}
                          </span>
                          <span className={`capitalize font-semibold ${
                            item.action === 'create' ? 'text-emerald-600' :
                            item.action === 'update' ? 'text-indigo-600' :
                            item.action === 'reject' ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {item.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Never applied to live production. Updates local demonstration state only.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={!importValidationResult?.isValid}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Validated Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
