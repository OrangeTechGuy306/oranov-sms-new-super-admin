'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { formatDate } from '@/lib/utils/formatters';
import { computeHealthSummary } from '@/lib/system-health/evaluator';
import { OperationalComponent, PlatformIncident } from '@/lib/system-health/types';

// Workspace Components
import { SystemHealthNotice } from '@/components/system-health/SystemHealthNotice';
import { SystemHealthSummaryCards } from '@/components/system-health/SystemHealthSummaryCards';
import { ComponentInventoryTable } from '@/components/system-health/ComponentInventoryTable';
import { ComponentDetailModal } from '@/components/system-health/ComponentDetailModal';
import { MetricExplorerWorkspace } from '@/components/system-health/MetricExplorerWorkspace';
import { IncidentManagementWorkspace } from '@/components/system-health/IncidentManagementWorkspace';
import { MaintenanceWindowsWorkspace } from '@/components/system-health/MaintenanceWindowsWorkspace';
import { DeploymentHistoryWorkspace } from '@/components/system-health/DeploymentHistoryWorkspace';
import { BackgroundJobsAndIntegrationsWorkspace } from '@/components/system-health/BackgroundJobsAndIntegrationsWorkspace';
import { CapacityMonitoringWorkspace } from '@/components/system-health/CapacityMonitoringWorkspace';
import { BackupReadinessWorkspace } from '@/components/system-health/BackupReadinessWorkspace';
import { AlertRulesWorkspace } from '@/components/system-health/AlertRulesWorkspace';
import { TenantOperationalReadinessWorkspace } from '@/components/system-health/TenantOperationalReadinessWorkspace';

import {
  Activity,
  Layers,
  LineChart,
  AlertTriangle,
  Wrench,
  GitCommit,
  Cpu,
  HardDrive,
  ShieldCheck,
  Bell,
  Building2,
  RefreshCw,
  FileText,
  Clock,
} from 'lucide-react';

export default function SystemHealthPage() {
  const {
    operationalComponents,
    platformIncidents,
    maintenanceWindows,
    deploymentRecords,
    backgroundJobs,
    externalIntegrations,
    capacityObservations,
    backupRecords,
    alertRules,
    organizations,
    acknowledgeIncident,
    transitionIncidentStatus,
    addIncidentNote,
    createMaintenanceWindow,
    updateMaintenanceWindow,
    cancelMaintenanceWindow,
    createAlertRule,
    updateAlertRule,
    toggleAlertRule,
    deleteAlertRule,
  } = usePlatformStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Component Inventory filter state
  const [compSearchQuery, setCompSearchQuery] = useState('');
  const [compCategoryFilter, setCompCategoryFilter] = useState('all');
  const [compStatusFilter, setCompStatusFilter] = useState('all');
  const [compEnvFilter, setCompEnvFilter] = useState('all');

  // Inspection Drawer states
  const [inspectComponent, setInspectComponent] = useState<OperationalComponent | null>(null);
  const [selectedIncidentForManagement, setSelectedIncidentForManagement] = useState<PlatformIncident | null>(null);

  // Simulated Telemetry Poll State
  const [lastRefreshed, setLastRefreshed] = useState<string>('2026-10-19T07:30:00Z');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date().toISOString());
      setIsRefreshing(false);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 3500);
    }, 450);
  };

  // Health summary metrics
  const healthSummary = useMemo(() => {
    return computeHealthSummary(operationalComponents, platformIncidents, lastRefreshed);
  }, [operationalComponents, platformIncidents, lastRefreshed]);

  // Filtered operational components for tab 1
  const filteredComponents = useMemo(() => {
    return operationalComponents.filter((comp) => {
      const matchesSearch =
        compSearchQuery.trim() === '' ||
        comp.name.toLowerCase().includes(compSearchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(compSearchQuery.toLowerCase()) ||
        comp.dependencies.some((d) => d.toLowerCase().includes(compSearchQuery.toLowerCase()));

      const matchesCat =
        compCategoryFilter === 'all' || comp.category === compCategoryFilter;

      let matchesStatus = true;
      if (compStatusFilter === 'all') {
        matchesStatus = true;
      } else if (compStatusFilter === 'unverified') {
        matchesStatus =
          comp.status === 'unknown' || comp.status === 'stale' || comp.status === 'not_connected';
      } else {
        matchesStatus = comp.status === compStatusFilter;
      }

      const matchesEnv =
        compEnvFilter === 'all' || comp.environment === compEnvFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesEnv;
    });
  }, [operationalComponents, compSearchQuery, compCategoryFilter, compStatusFilter, compEnvFilter]);

  const handleResetComponentFilters = () => {
    setCompSearchQuery('');
    setCompCategoryFilter('all');
    setCompStatusFilter('all');
    setCompEnvFilter('all');
  };

  const handleOpenIncidentFromModal = (inc: PlatformIncident) => {
    setInspectComponent(null);
    setSelectedIncidentForManagement(inc);
    setActiveTab('incidents');
  };

  // Tabs navigation definition
  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Health & Components',
      icon: <Layers className="w-3.5 h-3.5" />,
      count: operationalComponents.length,
    },
    {
      id: 'observability',
      label: 'Metric Explorer',
      icon: <LineChart className="w-3.5 h-3.5" />,
    },
    {
      id: 'incidents',
      label: 'Incidents & Triage',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      count: healthSummary.openIncidentsCount > 0 ? healthSummary.openIncidentsCount : undefined,
    },
    {
      id: 'maintenance',
      label: 'Maintenance Windows',
      icon: <Wrench className="w-3.5 h-3.5" />,
      count: maintenanceWindows.filter((w) => w.status === 'scheduled' || w.status === 'in_progress').length,
    },
    {
      id: 'deployments',
      label: 'Release & Deployments',
      icon: <GitCommit className="w-3.5 h-3.5" />,
      count: deploymentRecords.length,
    },
    {
      id: 'background',
      label: 'Jobs & Integrations',
      icon: <Cpu className="w-3.5 h-3.5" />,
      count: backgroundJobs.length,
    },
    {
      id: 'capacity',
      label: 'Capacity & Saturation',
      icon: <HardDrive className="w-3.5 h-3.5" />,
    },
    {
      id: 'backups',
      label: 'Backup & DR Readiness',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      count: backupRecords.length,
    },
    {
      id: 'alerts',
      label: 'Alert Rules & Policies',
      icon: <Bell className="w-3.5 h-3.5" />,
      count: alertRules.length,
    },
    {
      id: 'multi-tenant',
      label: 'Tenant Readiness Oversight',
      icon: <Building2 className="w-3.5 h-3.5" />,
      count: organizations.length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health, Observability & Platform Operations Governance"
        description="Comprehensive operational visibility across multi-tenant infrastructure, metric exploration, incident lifecycles, and disaster recovery readiness."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/audit-logs?category=system_configuration"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              Operational Audit Logs
            </Link>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Polling Mock Baseline...' : 'Refresh Telemetry Baseline'}
            </button>
          </div>
        }
      />

      {refreshToast && (
        <AlertBanner variant="info" title="Telemetry Baseline Updated">
          Simulated telemetry baseline updated against local storage snapshot. Freshness checks evaluated against {formatDate(lastRefreshed, true)}.
        </AlertBanner>
      )}

      {/* Non-Negotiable Source Notice */}
      <SystemHealthNotice />

      {/* High-level Summary Cards */}
      <SystemHealthSummaryCards
        summary={healthSummary}
        activeStatusFilter={compStatusFilter}
        onSelectStatusFilter={(status) => {
          setCompStatusFilter(status);
          setActiveTab('overview');
        }}
        onOpenIncidentsTab={() => setActiveTab('incidents')}
      />

      {/* Main Tabbed Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: HEALTH OVERVIEW & INVENTORY */}
      {activeTab === 'overview' && (
        <ComponentInventoryTable
          components={filteredComponents}
          searchQuery={compSearchQuery}
          onSearchChange={setCompSearchQuery}
          categoryFilter={compCategoryFilter}
          onCategoryChange={setCompCategoryFilter}
          statusFilter={compStatusFilter}
          onStatusChange={setCompStatusFilter}
          envFilter={compEnvFilter}
          onEnvChange={setCompEnvFilter}
          onResetFilters={handleResetComponentFilters}
          onInspectComponent={(comp) => setInspectComponent(comp)}
        />
      )}

      {/* TAB 2: METRICS & OBSERVABILITY EXPLORER */}
      {activeTab === 'observability' && (
        <MetricExplorerWorkspace components={operationalComponents} />
      )}

      {/* TAB 3: INCIDENT MANAGEMENT */}
      {activeTab === 'incidents' && (
        <IncidentManagementWorkspace
          incidents={platformIncidents}
          components={operationalComponents}
          onAcknowledge={acknowledgeIncident}
          onTransitionStatus={transitionIncidentStatus}
          onAddNote={addIncidentNote}
          selectedIncidentFromProps={selectedIncidentForManagement}
          onClearSelectedIncident={() => setSelectedIncidentForManagement(null)}
        />
      )}

      {/* TAB 4: MAINTENANCE WINDOWS */}
      {activeTab === 'maintenance' && (
        <MaintenanceWindowsWorkspace
          maintenanceWindows={maintenanceWindows}
          components={operationalComponents}
          onCreateWindow={createMaintenanceWindow}
          onUpdateWindow={updateMaintenanceWindow}
          onCancelWindow={cancelMaintenanceWindow}
        />
      )}

      {/* TAB 5: RELEASE & DEPLOYMENTS */}
      {activeTab === 'deployments' && (
        <DeploymentHistoryWorkspace
          deployments={deploymentRecords}
          components={operationalComponents}
        />
      )}

      {/* TAB 6: BACKGROUND JOBS & INTEGRATIONS */}
      {activeTab === 'background' && (
        <BackgroundJobsAndIntegrationsWorkspace
          backgroundJobs={backgroundJobs}
          externalIntegrations={externalIntegrations}
        />
      )}

      {/* TAB 7: CAPACITY & SATURATION */}
      {activeTab === 'capacity' && (
        <CapacityMonitoringWorkspace
          capacityObservations={capacityObservations}
        />
      )}

      {/* TAB 8: BACKUP & DISASTER RECOVERY */}
      {activeTab === 'backups' && (
        <BackupReadinessWorkspace
          backupRecords={backupRecords}
        />
      )}

      {/* TAB 9: ALERT RULES & POLICIES */}
      {activeTab === 'alerts' && (
        <AlertRulesWorkspace
          alertRules={alertRules}
          components={operationalComponents}
          onCreateRule={createAlertRule}
          onUpdateRule={updateAlertRule}
          onToggleRule={toggleAlertRule}
          onDeleteRule={deleteAlertRule}
        />
      )}

      {/* TAB 10: MULTI-TENANT READINESS OVERSIGHT */}
      {activeTab === 'multi-tenant' && (
        <TenantOperationalReadinessWorkspace
          organizations={organizations}
          components={operationalComponents}
          incidents={platformIncidents}
        />
      )}

      {/* Component Detail Drawer / Modal */}
      <ComponentDetailModal
        component={inspectComponent}
        onClose={() => setInspectComponent(null)}
        incidents={platformIncidents}
        maintenanceWindows={maintenanceWindows}
        onSelectIncident={handleOpenIncidentFromModal}
      />
    </div>
  );
}
