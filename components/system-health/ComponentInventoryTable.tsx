'use client';

import React from 'react';
import { OperationalComponent } from '@/lib/system-health/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  getComponentStatusBadge,
  getSourceClassificationBadge,
} from '@/lib/system-health/evaluator';
import {
  Search,
  Filter,
  Eye,
  RotateCcw,
  Server,
  Database,
  Mail,
  ShieldCheck,
  Activity,
  Layers,
  Cpu,
  HardDrive,
  CreditCard,
  BarChart2,
  ExternalLink,
} from 'lucide-react';

interface ComponentInventoryTableProps {
  components: OperationalComponent[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  envFilter: string;
  onEnvChange: (env: string) => void;
  onResetFilters: () => void;
  onInspectComponent: (comp: OperationalComponent) => void;
}

export function ComponentInventoryTable({
  components,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  envFilter,
  onEnvChange,
  onResetFilters,
  onInspectComponent,
}: ComponentInventoryTableProps) {
  const isFiltered =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    envFilter !== 'all';

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'frontend_application':
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'api_gateway':
        return <Server className="w-3.5 h-3.5 text-primary" />;
      case 'database_service':
      case 'cache_in_memory':
        return <Database className="w-3.5 h-3.5 text-emerald-500" />;
      case 'background_worker':
        return <Cpu className="w-3.5 h-3.5 text-amber-500" />;
      case 'file_object_storage':
        return <HardDrive className="w-3.5 h-3.5 text-cyan-500" />;
      case 'auth_identity':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />;
      case 'notification_provider':
        return <Mail className="w-3.5 h-3.5 text-indigo-500" />;
      case 'payment_billing':
        return <CreditCard className="w-3.5 h-3.5 text-rose-500" />;
      case 'reporting_analytics':
        return <BarChart2 className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const columns: Column<OperationalComponent>[] = [
    {
      key: 'name',
      header: 'Component & Architecture',
      render: (comp) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-muted/60 text-muted-foreground shrink-0">
                {getCategoryIcon(comp.category)}
              </span>
              <span className="font-semibold text-xs text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => onInspectComponent(comp)}>
                {comp.name}
              </span>
              {comp.version && (
                <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                  {comp.version}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm">
              {comp.description}
            </p>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category & Env',
      render: (comp) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-medium text-foreground capitalize block text-[11px]">
            {comp.category.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] uppercase font-mono px-1 rounded bg-muted text-muted-foreground inline-block">
            {comp.environment}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Operational Status',
      render: (comp) => {
        const badge = getComponentStatusBadge(comp.status);
        return (
          <div className="space-y-1">
            <Badge variant={badge.variant} size="sm" dot>
              {badge.label}
            </Badge>
            {comp.openIncidentId && (
              <span className="block text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                Linked Incident ({comp.openIncidentId})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'telemetry',
      header: 'Telemetry & Source',
      render: (comp) => {
        const sourceBadge = getSourceClassificationBadge(comp.statusSource);
        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <Badge variant={sourceBadge.variant} size="sm">
                {sourceBadge.label}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
              <span>Checked: {formatDate(comp.lastChecked, true)}</span>
              <span>•</span>
              <span className={comp.dataFreshness === 'stale' ? 'text-amber-600 font-bold' : ''}>
                {comp.dataFreshness.toUpperCase()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'dependencies',
      header: 'Dependencies',
      render: (comp) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {comp.dependencies.map((dep, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted/70 text-muted-foreground"
            >
              {dep}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect',
      render: (comp) => (
        <button
          type="button"
          onClick={() => onInspectComponent(comp)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-primary" />
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components, dependencies, descriptions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Architecture Categories</option>
            <option value="frontend_application">Frontend Applications</option>
            <option value="api_gateway">API Gateways & Routing</option>
            <option value="database_service">Database Services</option>
            <option value="cache_in_memory">In-Memory Caching</option>
            <option value="background_worker">Background Workers</option>
            <option value="file_object_storage">Object & File Storage</option>
            <option value="auth_identity">Authentication & Identity</option>
            <option value="notification_provider">Notification Providers</option>
            <option value="payment_billing">Payment & Billing</option>
            <option value="reporting_analytics">Reporting & Analytics</option>
            <option value="external_integration">External Integrations</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Operational States</option>
            <option value="healthy">Operational (Healthy)</option>
            <option value="degraded">Degraded Performance</option>
            <option value="critical">Critical Outages</option>
            <option value="unverified">Unverified / Stale / Disconnected</option>
            <option value="maintenance">Scheduled Maintenance</option>
          </select>

          {/* Environment Filter */}
          <div className="flex items-center gap-2">
            <select
              value={envFilter}
              onChange={(e) => onEnvChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="demo">Demo</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                title="Reset active filters"
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
          <span>
            Showing <strong>{components.length}</strong> operational components
            {isFiltered ? ' (filtered scope)' : ' across entire platform'}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-primary hover:underline text-xs font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Component Inventory Table */}
      <DataTable
        data={components}
        columns={columns}
        keyExtractor={(comp) => comp.id}
        emptyMessage="No operational components match your criteria. Try adjusting your search terms, category selections, or operational status filters."
      />
    </div>
  );
}
