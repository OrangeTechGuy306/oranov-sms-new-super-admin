'use client';

import React, { useState, useMemo } from 'react';
import {
  ReportCategoryKey,
  AnalyticsGlobalFilters,
  SavedReportConfig,
  GeneratedReportResult,
} from '@/lib/types/analytics';
import {
  REPORT_TEMPLATES,
  generateTabularReport,
  serializeReportToCsv,
  serializeReportToJson,
  triggerFileDownload,
} from '@/lib/analytics/exporter';
import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  AuditEvent,
} from '@/lib/types';
import { SupportTicket } from '@/lib/types/support-desk';
import { NotificationRecord } from '@/lib/types/communications';
import {
  FileText,
  Download,
  Bookmark,
  Trash2,
  Sparkles,
  Check,
  Eye,
  Filter,
  Copy,
  Table,
} from 'lucide-react';

interface ReportsExportsWorkspaceProps {
  filters: AnalyticsGlobalFilters;
  organizations: Organization[];
  subscriptions: OrganizationSubscription[];
  plans: SubscriptionPlan[];
  invoices: Invoice[];
  supportTickets: SupportTicket[];
  notifications: NotificationRecord[];
  auditEvents: AuditEvent[];
}

export function ReportsExportsWorkspace({
  filters,
  organizations,
  subscriptions,
  plans,
  invoices,
  supportTickets,
  notifications,
  auditEvents,
}: ReportsExportsWorkspaceProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<ReportCategoryKey>('executive_summary');
  const [savedReports, setSavedReports] = useState<SavedReportConfig[]>([
    {
      id: 'saved_rep_01',
      title: 'Q1 Tenant Lifecycle & Provisioning Roster',
      templateId: 'tenant_lifecycle',
      filters,
      selectedColumns: ['Organization ID', 'School Name', 'Lifecycle Status', 'Plan'],
      createdAt: '2026-03-15T10:00:00Z',
      updatedAt: '2026-03-15T10:00:00Z',
      isLocalOnly: true,
    },
    {
      id: 'saved_rep_02',
      title: 'Commercial Subscriptions & Aging Audit',
      templateId: 'subscriptions_revenue',
      filters,
      selectedColumns: ['Subscription ID', 'School Name', 'Plan ID', 'Status'],
      createdAt: '2026-03-18T14:30:00Z',
      updatedAt: '2026-03-18T14:30:00Z',
      isLocalOnly: true,
    },
  ]);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Generate real-time preview of the active report based on filters
  const currentReport = useMemo(() => {
    return generateTabularReport(selectedTemplateId, filters, {
      organizations,
      subscriptions,
      plans,
      invoices,
      supportTickets,
      notifications,
      auditEvents,
    });
  }, [selectedTemplateId, filters, organizations, subscriptions, plans, invoices, supportTickets, notifications, auditEvents]);

  const selectedTemplate = REPORT_TEMPLATES.find((t) => t.id === selectedTemplateId) || REPORT_TEMPLATES[0];

  const handleExportCsv = () => {
    const csvContent = serializeReportToCsv(currentReport);
    const dateStamp = new Date().toISOString().split('T')[0];
    const fileName = `saas-report-${selectedTemplateId}-${dateStamp}.csv`;
    triggerFileDownload(fileName, csvContent, 'text/csv;charset=utf-8;');
    setExportNotice(`Exported ${currentReport.rows.length} rows to ${fileName}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportJson = () => {
    const jsonContent = serializeReportToJson(currentReport);
    const dateStamp = new Date().toISOString().split('T')[0];
    const fileName = `saas-report-${selectedTemplateId}-${dateStamp}.json`;
    triggerFileDownload(fileName, jsonContent, 'application/json;charset=utf-8;');
    setExportNotice(`Exported JSON report to ${fileName}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleSaveCurrentReport = () => {
    if (!saveTitle.trim()) return;
    const newSaved: SavedReportConfig = {
      id: `saved_rep_${Date.now()}`,
      title: saveTitle.trim(),
      templateId: selectedTemplateId,
      filters,
      selectedColumns: currentReport.headers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocalOnly: true,
    };
    setSavedReports([newSaved, ...savedReports]);
    setSaveTitle('');
    setShowSaveModal(false);
    setExportNotice(`Saved report config "${newSaved.title}" to local session.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleDeleteSavedReport = (id: string) => {
    setSavedReports(savedReports.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Export Notice */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Enterprise Reports, Exporters & Custom Query Builder
        </h4>
        <p className="text-muted-foreground">
          Generate structured tabular reports reflecting currently active reporting filters.
          <strong className="text-foreground ml-1">Export Integrity:</strong> Generated CSV files include formula-injection neutralizing prefixes (<code className="text-foreground">=, +, -, @</code>) and compliance metadata comment headers.
        </p>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {exportNotice}
        </div>
      )}

      {/* Template Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_TEMPLATES.map((tmpl) => {
          const isSelected = tmpl.id === selectedTemplateId;
          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/5 border-primary shadow-xs'
                  : 'bg-card border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs">{tmpl.name}</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {tmpl.category}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {tmpl.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Report Action Bar */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Live Preview: {currentReport.title}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {currentReport.totalRowCount} Rows • Scope: {filters.dateRange.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1.5 bg-muted text-foreground font-semibold text-xs rounded-lg hover:bg-muted/80 flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-primary" />
            Save Preset
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-muted text-foreground font-semibold text-xs rounded-lg hover:bg-muted/80 flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            JSON
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Live Tabular Report Preview */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="overflow-x-auto border border-border rounded-lg max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold sticky top-0">
              <tr>
                {currentReport.headers.map((h) => (
                  <th key={h} className="p-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {currentReport.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  {currentReport.headers.map((h) => (
                    <td key={h} className="p-2.5 text-foreground whitespace-nowrap">
                      {String(row[h] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {currentReport.summaryFooters && (
          <div className="p-3 bg-muted/20 border border-border rounded-lg flex flex-wrap items-center gap-4 text-xs font-mono">
            {Object.keys(currentReport.summaryFooters).map((k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{k}:</span>
                <span className="font-bold text-foreground">
                  {String(currentReport.summaryFooters![k])}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Reports (Local Simulation) */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              Saved Report Configurations ({savedReports.length})
            </h4>
            <p className="text-xs text-muted-foreground">
              Stored in local client memory. These saved presets are local to this Super-Admin browser session.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {savedReports.map((saved) => (
            <div
              key={saved.id}
              className="p-3.5 bg-muted/20 border border-border rounded-xl flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-foreground">{saved.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Template: {saved.templateId} • Saved: {saved.createdAt.split('T')[0]}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(saved.templateId)}
                  className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded cursor-pointer"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSavedReport(saved.id)}
                  className="p-1 text-muted-foreground hover:text-rose-500 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              Save Report Preset
            </h3>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-muted-foreground block">
                Preset Title
              </label>
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="e.g. Monthly Executive Board Package"
                className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Saves current template ({selectedTemplateId}) and active filter parameters.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentReport}
                className="px-4 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 shadow-2xs"
              >
                Save Local Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
