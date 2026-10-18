'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { Modal } from '@/components/ui/Modal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { AuditEvent } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import { downloadCsvFile, generateCsvContent } from '@/lib/utils/csv-export';
import {
  Calendar,
  Eye,
  Download,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { auditEvents } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [inspectEvent, setInspectEvent] = useState<AuditEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((event) => {
      // Free text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          event.action.toLowerCase().includes(q) ||
          event.details.toLowerCase().includes(q) ||
          event.actor.name.toLowerCase().includes(q) ||
          event.targetEntity.toLowerCase().includes(q) ||
          (event.targetName && event.targetName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (categoryFilter !== 'all' && event.category !== categoryFilter) {
        return false;
      }

      // Severity
      if (severityFilter !== 'all' && event.severity !== severityFilter) {
        return false;
      }

      // Date range
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (new Date(event.timestamp).getTime() < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        if (new Date(event.timestamp).getTime() > end) return false;
      }

      return true;
    });
  }, [auditEvents, searchQuery, categoryFilter, severityFilter, startDate, endDate]);

  const handleExportCsv = () => {
    const headers = [
      'Event ID',
      'Timestamp',
      'Actor Name',
      'Actor Role',
      'Action',
      'Category',
      'Target Entity',
      'Target ID',
      'Target Name',
      'Severity',
      'Details',
    ];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.timestamp,
      e.actor.name,
      e.actor.role,
      e.action,
      e.category,
      e.targetEntity,
      e.targetId,
      e.targetName || '',
      e.severity,
      e.details,
    ]);
    const csv = generateCsvContent(headers, rows);
    downloadCsvFile(`audit-trail-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const columns: Column<AuditEvent>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (evt) => (
        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
          {formatDate(evt.timestamp, true)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (evt) => (
        <div className="text-xs">
          <span className="font-semibold text-foreground block">{evt.actor.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{evt.actor.role}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action & Category',
      render: (evt) => (
        <div className="space-y-0.5">
          <span className="font-bold text-xs text-foreground block font-mono">
            {evt.action}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize">
            {evt.category.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target Entity',
      render: (evt) => (
        <div className="text-xs">
          <span className="font-medium text-foreground block">{evt.targetEntity}</span>
          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px] block">
            {evt.targetName || evt.targetId}
          </span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (evt) => (
        <Badge
          variant={
            evt.severity === 'critical'
              ? 'error'
              : evt.severity === 'warning'
              ? 'warning'
              : 'neutral'
          }
          size="sm"
        >
          {evt.severity}
        </Badge>
      ),
    },
    {
      key: 'details',
      header: 'Event Summary',
      render: (evt) => (
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-sm">
          {evt.details}
        </p>
      ),
    },
    {
      key: 'inspect',
      header: '',
      align: 'right',
      render: (evt) => (
        <button
          type="button"
          onClick={() => setInspectEvent(evt)}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Inspect Event JSON"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Audit Logs & Administrative Trail"
        description="Chronological audit records of all administrative actions, organization lifecycle transitions, and configuration adjustments."
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Trail CSV
          </button>
        }
      />

      <AlertBanner variant="warning" title="Audit Log Integrity Notice">
        <strong>Development Sandbox Records:</strong> Audit events shown here are client-generated development fixtures and local UI event logs. They are not cryptographically sealed, tamper-evident, or legally defensible. Production compliance audit logs must be generated exclusively by backend microservices and stored in append-only immutable storage (e.g. AWS S3 Glacier with Object Lock).
      </AlertBanner>

      {/* Filter and Date Range Bar */}
      <div className="space-y-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search audit events by action, actor, target, or details..."
          resultCount={filteredEvents.length}
          onReset={handleReset}
          filters={[
            {
              key: 'category',
              label: 'Category',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: 'All Event Categories', value: 'all' },
                { label: 'Organization Lifecycle', value: 'organization_lifecycle' },
                { label: 'Subscription & Billing', value: 'subscription_billing' },
                { label: 'Platform Access', value: 'platform_access' },
                { label: 'System Configuration', value: 'system_configuration' },
                { label: 'Feature Toggles', value: 'feature_toggles' },
                { label: 'Security', value: 'security' },
              ],
            },
            {
              key: 'severity',
              label: 'Severity',
              value: severityFilter,
              onChange: setSeverityFilter,
              options: [
                { label: 'All Severities', value: 'all' },
                { label: 'Info', value: 'info' },
                { label: 'Warning', value: 'warning' },
                { label: 'Critical', value: 'critical' },
              ],
            },
          ]}
          actions={
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg border border-border">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-foreground focus:outline-none text-xs"
                  title="Filter from date"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg border border-border">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-foreground focus:outline-none text-xs"
                  title="Filter to date"
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredEvents}
        keyExtractor={(evt) => evt.id}
        pageSize={10}
        emptyMessage="No audit log events match the selected criteria."
      />

      {/* Inspect Event Modal */}
      {inspectEvent && (
        <Modal
          isOpen={true}
          onClose={() => setInspectEvent(null)}
          title={`Audit Event Details — ${inspectEvent.id}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border">
              <div>
                <span className="text-muted-foreground">Action:</span>
                <p className="font-bold text-foreground font-mono">{inspectEvent.action}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <p className="font-mono text-foreground">{formatDate(inspectEvent.timestamp, true)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Actor:</span>
                <p className="font-semibold text-foreground">{inspectEvent.actor.name} ({inspectEvent.actor.email})</p>
              </div>
              <div>
                <span className="text-muted-foreground">Target Entity:</span>
                <p className="font-mono text-foreground">{inspectEvent.targetEntity} ({inspectEvent.targetId})</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                Full Event Narrative
              </span>
              <p className="p-3 bg-muted/20 border border-border rounded-lg text-foreground/90 leading-relaxed">
                {inspectEvent.details}
              </p>
            </div>

            {inspectEvent.metadata && (
              <div className="space-y-1">
                <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                  Contextual JSON Metadata
                </span>
                <pre className="p-3 bg-muted rounded-lg font-mono text-[11px] overflow-x-auto text-foreground border border-border">
                  {JSON.stringify(inspectEvent.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
