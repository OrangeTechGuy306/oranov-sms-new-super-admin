'use client';

import React from 'react';
import { AuditEvent } from '@/lib/types/audit-logs';
import { Organization } from '@/lib/types/organizations';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  Calendar,
  Eye,
  RotateCcw,
  Search,
  Building2,
} from 'lucide-react';

interface AuditExplorerTableProps {
  events: AuditEvent[];
  totalEventsCount: number;
  organizations: Organization[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  severityFilter: string;
  onSeverityChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  orgFilter: string;
  onOrgChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onResetFilters: () => void;
  onInspectEvent: (evt: AuditEvent) => void;
}

export function AuditExplorerTable({
  events,
  totalEventsCount,
  organizations,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  orgFilter,
  onOrgChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  onInspectEvent,
}: AuditExplorerTableProps) {
  const isFiltered =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    severityFilter !== 'all' ||
    statusFilter !== 'all' ||
    orgFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    sortBy !== 'timestamp_desc';

  const columns: Column<AuditEvent>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (evt) => (
        <div className="space-y-0.5">
          <span className="text-xs text-foreground font-mono whitespace-nowrap block">
            {formatDate(evt.timestamp, true)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            {evt.correlationId || evt.id}
          </span>
        </div>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (evt) => (
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-foreground block">{evt.actor.name}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono">{evt.actor.role}</span>
            {evt.actor.actorType === 'super_admin' && (
              <span className="text-[9px] font-bold px-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                ROOT
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action & Domain',
      render: (evt) => (
        <div className="space-y-0.5 max-w-[200px]">
          <span className="font-bold text-xs text-foreground block font-mono truncate" title={evt.action}>
            {evt.action}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize block truncate">
            {evt.category.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target Entity',
      render: (evt) => {
        const orgMatch = evt.organizationId
          ? organizations.find((o) => o.id === evt.organizationId)
          : null;

        return (
          <div className="text-xs space-y-0.5">
            <span className="font-medium text-foreground block">{evt.targetEntity}</span>
            <span
              className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px] block"
              title={evt.targetName || evt.targetId}
            >
              {evt.targetName || evt.targetId}
            </span>
            {orgMatch && (
              <span className="inline-flex items-center gap-1 text-[10px] text-primary truncate max-w-[150px]">
                <Building2 className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{orgMatch.name}</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Outcome',
      render: (evt) => (
        <Badge
          variant={
            evt.status === 'succeeded'
              ? 'success'
              : evt.status === 'failed'
              ? 'error'
              : 'warning'
          }
          size="sm"
          dot
        >
          {evt.status}
        </Badge>
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
      header: 'Summary Narrative',
      render: (evt) => (
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs" title={evt.details}>
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
          onClick={() => onInspectEvent(evt)}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Inspect Event JSON & Metadata"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Search & Filters Control Panel */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-2xs space-y-3">
        {/* Row 1: Search & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by action, actor, target entity, correlation ID, or details..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            <span className="text-xs text-muted-foreground font-mono">
              <strong>{events.length}</strong> of {totalEventsCount} records
            </span>
          </div>
        </div>

        {/* Row 2: Granular Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-foreground focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="organization_lifecycle">Organization Lifecycle</option>
            <option value="subscription_billing">Subscription & Billing</option>
            <option value="platform_access">Platform Access & Roles</option>
            <option value="module_entitlements">Module Entitlements</option>
            <option value="system_configuration">System Configuration</option>
            <option value="feature_toggles">Feature Toggles</option>
            <option value="security">Security & Alerts</option>
            <option value="examination_governance">Examination Governance</option>
            <option value="academic_governance">Academic Governance</option>
            <option value="data_retention">Data Retention</option>
            <option value="compliance_governance">Compliance Governance</option>
            <option value="data_export">Data Export Activity</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-foreground focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-foreground focus:outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* School Organization Filter */}
          <select
            value={orgFilter}
            onChange={(e) => onOrgChange(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-foreground focus:outline-none truncate"
          >
            <option value="all">All School Tenancies</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          {/* Date Range Start */}
          <div className="flex items-center gap-1 bg-muted px-2 py-1.5 rounded-lg border border-border">
            <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none text-[11px] w-full"
              title="Filter from date"
            />
          </div>

          {/* Date Range End */}
          <div className="flex items-center gap-1 bg-muted px-2 py-1.5 rounded-lg border border-border">
            <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none text-[11px] w-full"
              title="Filter to date"
            />
          </div>
        </div>

        {/* Row 3: Sort selector */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-foreground font-semibold focus:outline-none"
            >
              <option value="timestamp_desc">Newest First (Timestamp Desc)</option>
              <option value="timestamp_asc">Oldest First (Timestamp Asc)</option>
              <option value="severity">Severity (Critical First)</option>
              <option value="action">Action Name (Alphabetical)</option>
            </select>
          </div>

          <span>
            {isFiltered
              ? `Filtered view: ${events.length} records matching search criteria.`
              : `Unfiltered view: ${events.length} total records.`}
          </span>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={events}
        keyExtractor={(evt) => evt.id}
        pageSize={10}
        emptyMessage="No audit log events match the selected criteria."
      />
    </div>
  );
}
