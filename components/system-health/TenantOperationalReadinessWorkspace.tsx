'use client';

import React, { useState, useMemo } from 'react';
import {
  TenantOperationalReadiness,
  OperationalComponent,
  PlatformIncident,
} from '@/lib/system-health/types';
import { Organization } from '@/lib/types/organizations';
import { evaluateTenantOperationalReadiness } from '@/lib/system-health/evaluator';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
  Layers,
  Globe,
  Radio,
} from 'lucide-react';

interface TenantOperationalReadinessWorkspaceProps {
  organizations: Organization[];
  components: OperationalComponent[];
  incidents: PlatformIncident[];
}

export function TenantOperationalReadinessWorkspace({
  organizations,
  components,
  incidents,
}: TenantOperationalReadinessWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('all');

  // Compute operational readiness for each organization without leaking PII
  const tenantReadinessList = useMemo(() => {
    return evaluateTenantOperationalReadiness(organizations, components, incidents);
  }, [organizations, components, incidents]);

  const filteredTenants = useMemo(() => {
    return tenantReadinessList.filter((tenant) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        tenant.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.organizationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.organizationId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLifecycle =
        lifecycleFilter === 'all' || tenant.lifecycleStatus === lifecycleFilter;

      return matchesSearch && matchesLifecycle;
    });
  }, [tenantReadinessList, searchQuery, lifecycleFilter]);

  const activeTenantsCount = tenantReadinessList.filter((t) => t.lifecycleStatus === 'active').length;
  const customDomainCount = tenantReadinessList.filter((t) => t.tenantIntegrationStatus.customDomainConfigured).length;
  const affectedByIncidentsCount = tenantReadinessList.filter((t) => t.openDemoIncidentsCount > 0).length;

  const columns: Column<TenantOperationalReadiness>[] = [
    {
      key: 'org',
      header: 'School Organization',
      render: (t) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-xs text-foreground">{t.organizationName}</span>
            <span className="font-mono text-[10px] px-1 rounded bg-muted text-muted-foreground">
              {t.organizationCode}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground block">
            ID: {t.organizationId}
          </span>
        </div>
      ),
    },
    {
      key: 'lifecycle',
      header: 'Lifecycle Status',
      render: (t) => {
        let variant: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
        if (t.lifecycleStatus === 'active') variant = 'success';
        else if (t.lifecycleStatus === 'pending') variant = 'warning';
        else if (t.lifecycleStatus === 'suspended') variant = 'error';

        return (
          <Badge variant={variant} size="sm">
            {t.lifecycleStatus.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'provisioning',
      header: 'Provisioning Readiness',
      render: (t) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-foreground capitalize block text-[11px]">
            {t.provisioningStatus.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {t.configuredModuleCount} configured modules
          </span>
        </div>
      ),
    },
    {
      key: 'integrations',
      header: 'Tenant Integration Status',
      render: (t) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3 text-primary" />
              Custom Domain SSL:
            </span>
            <Badge
              variant={t.tenantIntegrationStatus.sslCertificateStatus === 'active' ? 'success' : 'neutral'}
              size="sm"
            >
              {t.tenantIntegrationStatus.sslCertificateStatus === 'active' ? 'SSL Active' : 'Not Requested'}
            </Badge>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            SSO SAML: {t.tenantIntegrationStatus.ssoSamlConfigured ? 'Enabled' : 'Disabled'} • SIS Bridge: Not Connected
          </div>
        </div>
      ),
    },
    {
      key: 'dependencies',
      header: 'Platform Service Dependencies',
      render: (t) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {t.platformDependencies.map((dep, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground"
            >
              {dep}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'incidents',
      header: 'Platform Incident Impact',
      render: (t) => (
        <div>
          {t.openDemoIncidentsCount > 0 ? (
            <Badge variant="warning" size="sm" dot>
              Tier Impairment (1 Open)
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Nominal
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Privacy and Architectural Clarity Notice */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">Multi-Tenant Governance Boundaries</Badge>
          <span className="font-bold text-foreground">Four Architectural Principles:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-muted-foreground leading-relaxed">
          <div className="p-2.5 rounded-lg bg-muted/30">
            <strong className="text-foreground block">1. Shared Service Health:</strong>
            The state of underlying multi-tenant databases and API clusters.
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30">
            <strong className="text-foreground block">2. Configuration Readiness:</strong>
            Whether a school organization has configured required modules and campuses.
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30">
            <strong className="text-foreground block">3. Tenant Business Operations:</strong>
            Classroom enrollment and marks, which are isolated from platform telemetry.
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30">
            <strong className="text-foreground block">4. Zero Student PII:</strong>
            No student names, guardian emails, or grades are displayed or exposed.
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          title="Active Tenant Organizations"
          value={activeTenantsCount}
          subtitle={`of ${tenantReadinessList.length} total institutions`}
          icon={<Building2 className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Custom Domain Ingress"
          value={customDomainCount}
          subtitle="SSL edge proxies provisioned"
          icon={<Globe className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Affected by Demo Incidents"
          value={affectedByIncidentsCount}
          subtitle="Tier-level dependency impact"
          icon={<AlertTriangle className={`w-4 h-4 ${affectedByIncidentsCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />}
        />
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search school name, code, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <select
            value={lifecycleFilter}
            onChange={(e) => setLifecycleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Lifecycle States</option>
            <option value="active">Active Organizations</option>
            <option value="pending">Pending Onboarding</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>

        {(searchQuery || lifecycleFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setLifecycleFilter('all');
            }}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={filteredTenants}
        columns={columns}
        keyExtractor={(t) => t.organizationId}
        emptyMessage="No organizations found matching your search or lifecycle filter."
      />
    </div>
  );
}
