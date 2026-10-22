'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { AnalyticsReportingToolbar } from '@/components/analytics/AnalyticsReportingToolbar';
import { ExecutiveOverviewPanel } from '@/components/analytics/ExecutiveOverviewPanel';
import { TenantGrowthPanel } from '@/components/analytics/TenantGrowthPanel';
import { MonetizationPanel } from '@/components/analytics/MonetizationPanel';
import { ModuleAdoptionPanel } from '@/components/analytics/ModuleAdoptionPanel';
import { SupportSuccessPanel } from '@/components/analytics/SupportSuccessPanel';
import { OperationsPanel } from '@/components/analytics/OperationsPanel';
import { CommunicationsPanel } from '@/components/analytics/CommunicationsPanel';
import { AuditGovernancePanel } from '@/components/analytics/AuditGovernancePanel';
import { ReportsExportsWorkspace } from '@/components/analytics/ReportsExportsWorkspace';
import { MetricCatalogPanel } from '@/components/analytics/MetricCatalogPanel';
import {
  getDefaultAnalyticsFilters,
  computeExecutiveSummary,
  computeTenantGrowthMetrics,
  computeMonetizationMetrics,
  computeModuleAdoptionMetrics,
  computeSupportSuccessMetrics,
  computeOperationsMetrics,
  computeCommunicationsMetrics,
  computeAuditGovernanceMetrics,
} from '@/lib/analytics/evaluator';
import { MASTER_MODULE_REGISTRY } from '@/lib/modules/registry-data';
import { AnalyticsGlobalFilters } from '@/lib/types/analytics';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Layers,
  LifeBuoy,
  Activity,
  Bell,
  ShieldCheck,
  FileSpreadsheet,
  BookOpen,
  Download,
} from 'lucide-react';

export default function PlatformAnalyticsWorkspacePage() {
  const {
    organizations,
    campuses,
    subscriptions,
    plans,
    invoices,
    payments,
    supportTickets,
    slaPolicies,
    csatRecords,
    csTasks,
    operationalComponents,
    platformIncidents,
    capacityObservations,
    backupRecords,
    notificationRecords,
    communicationTemplates,
    auditEvents,
    securityEvents,
    complianceControls,
    organizationModuleOverrides,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<string>('executive_overview');
  const [filters, setFilters] = useState<AnalyticsGlobalFilters>(getDefaultAnalyticsFilters());

  const handleResetFilters = () => {
    setFilters(getDefaultAnalyticsFilters());
  };

  const handleCurrencyChange = (curr: string) => {
    setFilters({ ...filters, currency: curr });
  };

  // Computations
  const executiveKpi = useMemo(() => {
    return computeExecutiveSummary(
      organizations,
      subscriptions,
      plans,
      supportTickets,
      operationalComponents,
      notificationRecords,
      auditEvents,
      securityEvents,
      filters
    );
  }, [organizations, subscriptions, plans, supportTickets, operationalComponents, notificationRecords, auditEvents, securityEvents, filters]);

  const tenantGrowthMetrics = useMemo(() => {
    return computeTenantGrowthMetrics(organizations, campuses, filters);
  }, [organizations, campuses, filters]);

  const monetizationMetrics = useMemo(() => {
    return computeMonetizationMetrics(subscriptions, plans, invoices, payments, filters);
  }, [subscriptions, plans, invoices, payments, filters]);

  const moduleMetrics = useMemo(() => {
    return computeModuleAdoptionMetrics(
      organizations,
      plans,
      organizationModuleOverrides,
      MASTER_MODULE_REGISTRY,
      filters
    );
  }, [organizations, plans, organizationModuleOverrides, filters]);

  const supportMetrics = useMemo(() => {
    return computeSupportSuccessMetrics(
      supportTickets,
      slaPolicies,
      csatRecords,
      csTasks,
      organizations,
      filters
    );
  }, [supportTickets, slaPolicies, csatRecords, csTasks, organizations, filters]);

  const operationsMetrics = useMemo(() => {
    return computeOperationsMetrics(
      operationalComponents,
      platformIncidents,
      capacityObservations,
      backupRecords,
      filters
    );
  }, [operationalComponents, platformIncidents, capacityObservations, backupRecords, filters]);

  const communicationsMetrics = useMemo(() => {
    return computeCommunicationsMetrics(
      notificationRecords,
      communicationTemplates,
      filters
    );
  }, [notificationRecords, communicationTemplates, filters]);

  const auditGovernanceMetrics = useMemo(() => {
    return computeAuditGovernanceMetrics(
      auditEvents,
      securityEvents,
      complianceControls,
      filters
    );
  }, [auditEvents, securityEvents, complianceControls, filters]);

  // Tab definitions
  const tabs: TabItem[] = [
    {
      id: 'executive_overview',
      label: 'Executive Overview',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'tenant_growth',
      label: 'Tenant Growth & Lifecycle',
      icon: <Building2 className="w-3.5 h-3.5" />,
      count: tenantGrowthMetrics.totalRegistered,
    },
    {
      id: 'monetization',
      label: 'Subscriptions & Monetization',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      count: monetizationMetrics.activePaidSubscriptions,
    },
    {
      id: 'module_adoption',
      label: 'Module Adoption',
      icon: <Layers className="w-3.5 h-3.5" />,
      count: moduleMetrics.totalModulesInRegistry,
    },
    {
      id: 'support_cs',
      label: 'Support & Success',
      icon: <LifeBuoy className="w-3.5 h-3.5" />,
      count: supportMetrics.currentlyOpenTickets,
    },
    {
      id: 'operations',
      label: 'Platform Operations',
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: <Bell className="w-3.5 h-3.5" />,
    },
    {
      id: 'audit_governance',
      label: 'Audit & Governance',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      count: auditGovernanceMetrics.totalAuditEventsInPeriod,
    },
    {
      id: 'reports_exports',
      label: 'Reports & Exports',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      id: 'metric_catalog',
      label: 'Metric Catalog',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics & Business Intelligence"
        description="Cross-tenant performance indicators, subscription run-rate, module adoption, support SLAs, and executive governance."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('reports_exports')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground text-xs font-semibold rounded-lg hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Exports Hub
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metric_catalog')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Metric Catalog
            </button>
          </div>
        }
      />

      {/* Global Reporting Controls Toolbar */}
      <AnalyticsReportingToolbar
        filters={filters}
        onFilterChange={setFilters}
        organizations={organizations}
        plans={plans}
        onResetFilters={handleResetFilters}
      />

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Dynamic Tab Workspace Panels */}
      {activeTab === 'executive_overview' && (
        <ExecutiveOverviewPanel
          kpi={executiveKpi}
          tenantGrowth={tenantGrowthMetrics}
          monetization={monetizationMetrics}
          modules={moduleMetrics}
          support={supportMetrics}
          operations={operationsMetrics}
          communications={communicationsMetrics}
          filters={filters}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'tenant_growth' && (
        <TenantGrowthPanel
          metrics={tenantGrowthMetrics}
          organizations={organizations}
          plans={plans}
          filters={filters}
        />
      )}

      {activeTab === 'monetization' && (
        <MonetizationPanel
          metrics={monetizationMetrics}
          filters={filters}
          onCurrencyChange={handleCurrencyChange}
        />
      )}

      {activeTab === 'module_adoption' && (
        <ModuleAdoptionPanel metrics={moduleMetrics} filters={filters} />
      )}

      {activeTab === 'support_cs' && (
        <SupportSuccessPanel metrics={supportMetrics} filters={filters} />
      )}

      {activeTab === 'operations' && (
        <OperationsPanel metrics={operationsMetrics} filters={filters} />
      )}

      {activeTab === 'communications' && (
        <CommunicationsPanel
          metrics={communicationsMetrics}
          notifications={notificationRecords}
          filters={filters}
        />
      )}

      {activeTab === 'audit_governance' && (
        <AuditGovernancePanel
          metrics={auditGovernanceMetrics}
          filters={filters}
        />
      )}

      {activeTab === 'reports_exports' && (
        <ReportsExportsWorkspace
          filters={filters}
          organizations={organizations}
          subscriptions={subscriptions}
          plans={plans}
          invoices={invoices}
          supportTickets={supportTickets}
          notifications={notificationRecords}
          auditEvents={auditEvents}
        />
      )}

      {activeTab === 'metric_catalog' && <MetricCatalogPanel />}
    </div>
  );
}
