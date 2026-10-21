'use client';

import React, { useState, useMemo } from 'react';
import { DeploymentRecord, OperationalComponent } from '@/lib/system-health/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertOctagon,
  Search,
  Filter,
  ShieldCheck,
  Tag,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface DeploymentHistoryWorkspaceProps {
  deployments: DeploymentRecord[];
  components: OperationalComponent[];
}

export function DeploymentHistoryWorkspace({
  deployments,
  components,
}: DeploymentHistoryWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [envFilter, setEnvFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');

  const filteredDeployments = useMemo(() => {
    return deployments.filter((dep) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        dep.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dep.changeSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dep.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dep.gitCommitHash && dep.gitCommitHash.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || dep.status === statusFilter;
      const matchesEnv = envFilter === 'all' || dep.environment === envFilter;
      const matchesComp = componentFilter === 'all' || dep.componentId === componentFilter;

      return matchesSearch && matchesStatus && matchesEnv && matchesComp;
    });
  }, [deployments, searchQuery, statusFilter, envFilter, componentFilter]);

  const succeededCount = deployments.filter((d) => d.status === 'succeeded').length;
  const inProgressCount = deployments.filter((d) => d.status === 'in_progress').length;
  const rolledBackCount = deployments.filter((d) => d.status === 'rolled_back').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="success" size="sm" dot>SUCCEEDED</Badge>;
      case 'in_progress':
        return <Badge variant="warning" size="sm" dot>IN PROGRESS</Badge>;
      case 'rolled_back':
        return <Badge variant="purple" size="sm">ROLLED BACK</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">FAILED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status.toUpperCase()}</Badge>;
    }
  };

  const columns: Column<DeploymentRecord>[] = [
    {
      key: 'version',
      header: 'Release Version & Commit',
      render: (dep) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-xs font-mono text-foreground">{dep.version}</span>
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-muted text-muted-foreground">
              {dep.environment}
            </span>
          </div>
          {dep.gitCommitHash && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-muted-foreground" />
              commit: {dep.gitCommitHash}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'component',
      header: 'Component',
      render: (dep) => (
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-foreground block">{dep.componentName}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{dep.componentId}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Deployment Status',
      render: (dep) => getStatusBadge(dep.status),
    },
    {
      key: 'changeSummary',
      header: 'Release Change Summary',
      render: (dep) => (
        <div className="space-y-1 max-w-sm text-xs">
          <p className="text-foreground leading-relaxed">{dep.changeSummary}</p>
          <span className="text-[10px] font-mono text-muted-foreground block">
            Initiated by: {dep.initiatingUser}
          </span>
        </div>
      ),
    },
    {
      key: 'timestamps',
      header: 'Deployment Timeline',
      render: (dep) => (
        <div className="text-xs font-mono space-y-0.5">
          <span className="text-muted-foreground block">
            Started: {formatDate(dep.startedAt, true)}
          </span>
          <span className="text-foreground block">
            Completed: {dep.completedAt ? formatDate(dep.completedAt, true) : 'Executing...'}
          </span>
        </div>
      ),
    },
    {
      key: 'rollback',
      header: 'Rollback Capability (Descriptor Only)',
      render: (dep) => (
        <div className="space-y-1 text-xs">
          {dep.rollbackCapability.isAvailable ? (
            <div className="p-1.5 rounded bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/50 text-[10px] space-y-0.5">
              <span className="font-bold text-blue-700 dark:text-blue-300 block">
                Target: {dep.rollbackCapability.targetVersion}
              </span>
              <span className="text-muted-foreground leading-tight block">
                {dep.rollbackCapability.descriptorOnlyNote}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">
              {dep.rollbackCapability.descriptorOnlyNote}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="purple" size="md">Release Audit Log</Badge>
          <p className="text-muted-foreground">
            Release logs capture semantic versions, git commit hashes, and rollback metadata. Live build dispatch requires external CI/CD pipeline integration.
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
          Source: Verified Codebase &amp; Fixtures
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Successful Deployments"
          value={succeededCount}
          subtitle="Production baseline"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Staging In-Progress"
          value={inProgressCount}
          subtitle="Pre-release verification"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Rollback Records"
          value={rolledBackCount}
          subtitle="Safety reversion history"
          icon={<RotateCcw className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs text-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search version, commit, summary..."
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
            <option value="all">All Deployment States</option>
            <option value="succeeded">Succeeded</option>
            <option value="in_progress">In Progress</option>
            <option value="rolled_back">Rolled Back</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Components</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {(searchQuery || statusFilter !== 'all' || envFilter !== 'all' || componentFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setEnvFilter('all');
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

      {/* Deployments Table */}
      <DataTable
        data={filteredDeployments}
        columns={columns}
        keyExtractor={(dep) => dep.id}
        emptyMessage="No release records found matching your filters."
      />
    </div>
  );
}
